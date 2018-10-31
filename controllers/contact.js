
const Json2csvParser = require('json2csv').Parser;
const csv = require('csvtojson');
const Contact = require('../models/Contact');
/**
 * GET /contact
 * Contact form page.
 */
exports.getAllContacts = async (req, res) => {
  const findAllRes = await Contact.getAllContacts();
  if (!findAllRes) {
    req.flash('errors', { msg: 'Create the contact unsuccessfully' });
    res.status(500).redirect('/contact/add');
    return;
  }
  const userId = req.user._id;
  res.render('contact/contact-list', { listContact: findAllRes, Owner: userId });
};

exports.getAddContact = async (req, res) => {
  const allContact = await Contact.getAllContacts();
  res.render('contact/add-contact', { allContact });
};

exports.deleteContacts = async (req, res) => {
  const { listContactNeedToBeDelete } = req.body;
  for (contactId of listContactNeedToBeDelete) {
    try {
      await Contact.deleteContact(contactId);
    } catch (ex) {
      console.log('Delete errors')
    }
  }
  return res.status(200).json({ msg: 'delete successfully!' });
};
const validateAddData = (addReq) => {
  const {
    firstName, lastName, middleName, gender, dob, startDate
  } = addReq.body;

  if (!firstName || !lastName || !middleName || !gender || !dob || !startDate) {
    return;
  }

  addReq.assert('firstName', 'Fisrt Name cannot longger than 10 characters').isLength({ min: 1, max: 10 });
  addReq.assert('lastName', 'Last Name cannot be blank').isLength({ min: 1, max: 10 });
  addReq.assert('middleName', 'Middle cannot be blank').isLength({ max: 10 });
  addReq.assert('gender', 'FisrtName cannot be blank').isBoolean();

  const errors = addReq.validationErrors();
  if (errors) {
    console.log('err', errors);
    return;
  }
  const nowYear = (new Date()).getFullYear();
  const dateOfBirthYear = new Date(dob).getFullYear();

  if ((nowYear - dateOfBirthYear) < 22) {
    return;
  }
  return true;
};

exports.postAddContact = async (req, res) => {
  const validateRes = validateAddData(req);
  if (!validateRes) {
    req.flash('errors', { msg: 'Create the contact unsuccessfully, invalid inputs' });
    res.status(400).redirect('/contact/add');
    return;
  }
  const {
    firstName, lastName, middleName, gender, directManager, dob, startDate
  } = req.body;
  console.log(req.body);
  const userId = req.user._id;
  const contactData = {
    userId,
    firstName,
    lastName,
    middleName,
    gender,
    directManager,
    dob,
    startDate,
  };
  const createRes = await Contact.createContact(contactData);
  if (!createRes) {
    req.flash('errors', { msg: 'Create the contact unsuccessfully!' });
    res.status(500).redirect('/contact/add');
    return;
  }
  res.status(200).redirect('/contact');
};

exports.getEditContact = async (req, res) => {
  const { id } = req.query;
  const contact = await Contact.getContactById(id);
  const allContact = await Contact.getAllContacts();
  if (!contact) {
    return res.status(204).json({
      msg: 'data not found'
    });
  }
  const owner = req.user._id;
  return res.render('contact/edit-contact', { contact, allContact, owner });
};

exports.postEditContact = async (req, res) => {
  const validateRes = validateAddData(req);
  if (!validateRes) {
    req.flash('errors', { msg: 'edit the contact unsuccessfully, invalid inputs' });
    res.status(400).redirect('/contact/edit');
    return;
  }
  const {
    firstName, lastName, middleName, gender, directManager, dob, startDate, owner, id
  } = req.body;

  const userId = req.user._id;
  if (JSON.stringify(userId) !== JSON.stringify(owner)) {
    res.status(403).redirect('/contact/edit');
    return;
  }
  const updateData = {
    userId,
    firstName,
    lastName,
    middleName,
    gender,
    directManager,
    dob,
    startDate,
  };
  const updateRes = await Contact.updateContactById(id, updateData);
  if (!updateRes) {
    console.log('Update the contact unsuccessfully!');
    req.flash('errors', { msg: 'Update the contact unsuccessfully!' });
    res.status(500).redirect('/contact/edit');
    return;
  }
  res.status(200).redirect('/contact');
};

exports.exportContacts = async (req, res) => {
  try {
    if (!req || !req.user) {
      res.status(403).json({
        error: {
          message: '403: Forbidden',
        },
      });
      return;
    }
    const contactFields = ['First Name', 'Last Name', 'Middle Name', 'Manager Id', 'DOB', 'Gender', 'Start Date'];
    const json2csv = new Json2csvParser({ contactFields });
    const contacts = await Contact.getAllContacts();
    const csvData = contacts.map((contact) => {
      return {
        firstName: contact.firstName,
        lastName: contact.lastName,
        middleName: contact.middleName,
        managerId: contact.directManager,
        dob: contact.dob.toString(),
        gender: contact.gender,
        startDate: contact.startDate.toString(),
      };
    });
    const csv = json2csv.parse(csvData);
    res.setHeader('Content-disposition', 'attachment; filename=contacts.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (ex) {
    res.status(500).json({
      error: {
        message: '500: Internal Server Error',
      },
    });
  }
};

exports.importContacts = async (req, res) => {
  try {
    if (!req || !req.user) {
      res.status(403).json({
        error: {
          message: '403: Forbidden',
        },
      });
      return;
    }
    const userId = req.user._id;
    const csvJsonData = req.file.buffer.toString('utf8');
    const jsonContactList = await csv().fromString(csvJsonData);
    console.log('req.file.buffer.toStri', jsonContactList);
    for (const contact of jsonContactList) {
      try {
        contact.userId = userId;
        Contact.createContact(contact);
      } catch (ex) {
        console.log(ex);
      }
    }
    res.status(200).json({
      msg: 'Import successfully!'
    });
  } catch (ex) {
    res.status(500).json({
      error: {
        message: '500: Internal Server Error',
      },
    });
  }
};

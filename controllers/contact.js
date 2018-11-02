
const Json2csvParser = require('json2csv').Parser;
const csv = require('csvtojson');
const Contact = require('../models/Contact');
/**
 * GET /contact
 * Contact form page.
 */

const render500ErrorPage = (ex, res) => {
  const error = {
    code: 500,
    message: `Internal Server Error: ${ex}`
  }
  res.status(500);
  return res.render('error', error);
}

exports.getAllContacts = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      return res.render('error', error);
    }
    const findAllRes = await Contact.getAllContacts();
    const userId = req.user._id;
    res.status(200)
    return res.render('contact/contact-list', { listContact: findAllRes, Owner: userId });
  } catch (ex) {
    render500ErrorPage(ex, res)
  }
}

exports.getAddContact = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      res.render('error', error);
      return;
    }
    const allContact = await Contact.getAllContacts();
    res.status(200);
    res.render('contact/add-contact', { allContact });
  } catch (ex) {
    const error = {
      code: 500, message:
        `Internal Server Error: ${ex}`
    }
    res.status(500);
    res.render('error', error);
  }
};

exports.deleteContacts = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      res.render('error', error);
      return;
    }
    const { listContactNeedToBeDelete } = req.body;
    if (!listContactNeedToBeDelete) {
      const error = {
        code: 400,
        message: 'Bad Request'
      }
      res.status(400);
      res.render('error', error);
      return;
    }
    for (const contactId of listContactNeedToBeDelete) {
      try {
        await Contact.deleteContact(contactId);
      } catch (ex) {
        console.log('Delete errors')
      }
    }
    return res.status(200).json({ msg: 'delete successfully!' });
  } catch (ex) {
    render500ErrorPage(ex, res);

  }
}
const validateData = (addReq) => {
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
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.render('error', error);
      return;
    }
    const validateRes = validateData(req);
    if (!validateRes) {
      req.flash('errors', { msg: 'Create the contact unsuccessfully, invalid inputs' });
      res.status(400).redirect('/contact/add');
      return;
    }
    const {
      firstName, lastName, middleName, gender, directManager, dob, startDate
    } = req.body;
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
    res.status(200).redirect('/contact');
  } catch (ex) {
    render500ErrorPage(ex, res);
  }
};

exports.getEditContact = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      res.render('error', error);
      return;
    }
    const { id } = req.query;
    if (!id) {
      const error = {
        code: 400,
        message: 'Bad Request',
      }
      res.status(400);
      res.render('error', error);
      return;
    }
    const contact = await Contact.getContactById(id);
    const allContact = await Contact.getAllContacts();
    if (!contact) {
      const error = {
        code: 204,
        message: `Data Not Found`,
      }
      res.status(400);
      res.render('error', error);
      return;
    }
    const owner = req.user._id;
    res.status(200)
    res.render('contact/edit-contact', { contact, allContact, owner });
  } catch (ex) {
    render500ErrorPage(ex, res);
  }
}
exports.postEditContact = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      res.render('error', error);
      return;
    }
    const validateRes = validateData(req);
    if (!validateRes) {
      req.flash('errors', { msg: 'Update the contact unsuccessfully, invalid inputs' });
      res.status(400).redirect(`/contact/edit?id=${req.body.id}`);
      return;
    }
    const {
      firstName, lastName, middleName, gender, directManager, dob, startDate, owner, id
    } = req.body;

    const userId = req.user._id;
    if (JSON.stringify(userId) !== JSON.stringify(owner)) {
      const error = {
        code: 400,
        message: 'Bad Request',
      }
      res.status(400);
      res.render('error', error);
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
    res.status(200).redirect('/contact');
  } catch (ex) {
    render500ErrorPage(ex, res);
  };
}

exports.exportContacts = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      res.render('error', error);
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
    render500ErrorPage(ex, res);
  };
}

exports.importContacts = async (req, res) => {
  try {
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      res.render('error', error);
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
      msg: 'import successfully!'
    })
  } catch (ex) {
    render500ErrorPage(ex, res);
  };
}

exports.getContactByFullName = async (req, res) => {
  try {
    console.log('getContactByFullName')
    if (!req || !req.user) {
      const error = {
        code: 403,
        message: 'Forbidden',
      }
      res.status(403);
      return res.render('error', error);
    }
    const { searchInput } = req.body
    console.log('firstnamae', searchInput)
    const nameArray = searchInput.split(" ");
    const userId = req.user._id;
    if (!searchInput || nameArray.length < 2) {
      return res.redirect('/contact')
    }
    if (nameArray.length === 2) {
      const contact = await Contact.findByFullName(nameArray[0], nameArray[1]);
      if (contact) {
        console.log('have contact')
        // res.status(200).redirect('/contact/add')
        return res.render('contact/contact-list', { listContact: contact, Owner: userId });
      }
    }




    res.status(200).json({
      msg: 'a'
    })

  } catch (ex) {
    render500ErrorPage(ex, res)
  }
}

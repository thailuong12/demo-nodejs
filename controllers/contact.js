
const Contact = require('../models/Contact');
const _ = require('lodash')
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
    req.flash('errors', { msg: 'Create the contact unsuccessfully' });
    res.status(500).redirect('/contact/add');
    return;
  }
  res.status(200).redirect('/contact');
};

exports.editContact = async (req, res) => {
  const { id } = req.query;
  const contact = await Contact.getContactById(id);
  const allContact = await Contact.getAllContacts();
  if (!contact) {
    return res.status(204).json({
      msg: 'data not found'
    });
  }
  console.log(contact);
  return res.render('contact/edit-contact', { contact, allContact });
};

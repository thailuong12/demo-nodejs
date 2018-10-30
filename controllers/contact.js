
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
  res.render('contact/contact-list', { listContact: findAllRes });
};

exports.getAddContact = (req, res) => {
  res.render('contact/add-contact', {});
};

const validateAddData = (firstName, lastName, middleName, gender, manager, dob, startDate) => {
  if (!firstName || !lastName || !middleName || !gender || !manager || !dob || !startDate) {
    return false;
  }
  const nowYear = (new Date()).getFullYear();
  const dateOfBirthYear = new Date(dob).getFullYear();

  if ((nowYear - dateOfBirthYear) < 22) {
    return false;
  }
  return true;
};

exports.postAddContact = async (req, res) => {
  const {
    firstName, lastName, middleName, gender, manager, dob, startDate
  } = req.body;
  const validateRes = validateAddData(firstName, lastName, middleName, gender, manager, dob, startDate);
  if (!validateRes) {
    req.flash('errors', { msg: 'Create the contact unsuccessfully, invalid inputs' });
    res.status(400).redirect('/contact/add');
    return;
  }
  console.log('req.user', req.user);
  const contactData = {
    firstName,
    lastName,
    middleName,
    gender,
    manager,
    dob,
    startDate
  };
  const createRes = await Contact.createContact(contactData);
  if (!createRes) {
    req.flash('errors', { msg: 'Create the contact unsuccessfully' });
    res.status(500).redirect('/contact/add');
    return;
  }
  console.log(createRes);
  res.status(200).redirect('/contact');
};

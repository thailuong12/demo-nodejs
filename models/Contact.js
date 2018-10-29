const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    middleName: String,
    gender: String,
    directManager: String,
    dob: String,
    startDate: String
});

const Contact = mongoose.model('Contact', contactSchema);
module.exports.createContact = (contactData) => {
    return new Promise((resolve, reject) => {
        Contact.create(contactData, (err, contact) => {
            if (err) {
                reject(err);
            }
            resolve(contact);
        });
    });
};

module.exports.getAllContacts = () => {
    return new Promise((resolve, reject) => {
        Contact.find({}, (err, contacts) => {
            if (err) {
                reject(err);
            }
            resolve(contacts);
        });
    });
};

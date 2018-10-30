const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    middleName: String,
    gender: Boolean,
    directManager: String,
    dob: String,
    startDate: String,
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

module.exports.deleteContact = (id) => {
    return new Promise((resolve, reject) => {
        Contact.findByIdAndRemove({ _id: id }, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

module.exports.getContactById = (id) => {
    return new Promise((resolve, reject) => {
        Contact.findOne({ _id: id }, (err, contact) => {
            if (err) {
                reject(err);
            }
            resolve(contact);
        });
    });
};

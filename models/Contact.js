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
        const {
            firstName, lastName, middleName, gender, directManager, dob, startDate, userId
        } = contactData;
        Contact.create(
            {
                userId,
                firstName,
                lastName,
                middleName,
                gender,
                directManager,
                dob,
                startDate,
            }, (err, contact) => {
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

module.exports.deleteContact = (id, userId) => {
    return new Promise((resolve, reject) => {
        Contact.findByIdAndRemove({ _id: id, userId }, (err, res) => {
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

module.exports.updateContactById = (id, updateData) => {
    return new Promise((resolve, reject) => {
        Contact.findByIdAndUpdate({ _id: id }, updateData,{new: true} ,(err, res) => {
            if (err) {
                console.log('err', err);
                reject(err);
            }
            console.log('res', res);
            resolve(res);
        })
    });
};

module.exports.findByFullName = (firstName, lastName) => {
    return new Promise((resolve, reject) => {
        Contact.find({firstName, lastName}, (err, res) => {
            if(err) {
                reject(err);
            }
            resolve(res)
        })
    })
}

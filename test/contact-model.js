const { expect } = require('chai');
const sinon = require('sinon');
require('sinon-mongoose');

const Contact = require('../models/Contact');

let contactId = ''

describe('Contact Model',  () => {
    it('should create a new contact', async () => {

        const contactObject = {
            userId: 'test',
            firstName: 'first name',
            lastName: 'last name',
            middleName: 'middle name',
            gender: true,
            directManager: '',
            dob: '1984-10-10',
            startDate: '2016-10-10',
        }

        const res = await Contact.createContact(contactObject);
        contactId = res._id;
        expect(res).to.be.an('object');
    });

    it('should create a new contact', async () => {

        const contactObject = {
            userId: 'test',
            firstName: 'first name',
            lastName: 'last name',
            middleName: 'middle name',
            gender: true,
            directManager: contactId,
            dob: '1984-10-10',
            startDate: '2016-10-10',
        }

        const res = await Contact.createContact(contactObject);
        
        expect(res).to.be.an('object');
    });

    it('should return all contacts', async () => {
        
        const res = await Contact.getAllContacts();
        
        expect(res.length).to.be.above(0);
    });
    
    it('should return the contact by id', async () => {
        
        const res = await Contact.getContactById(contactId);
        
        expect(JSON.stringify(res._id)).to.equal(JSON.stringify(contactId));
    });

    it('should update the contact', async () => {
        const newName = 'new name'
        const contactObject = {
            userId: 'test',
            firstName: newName,
            lastName: 'new name',
            middleName: 'new name',
            gender: false,
            directManager: contactId,
            dob: '1984-10-10',
            startDate: '2016-10-10',
        }

        const res = await Contact.updateContactById(contactId, contactObject);
        expect(res.firstName).to.equal(newName  );
    });
    it('should delete the contact', async () => {
        
        const res = await Contact.deleteContact(contactId);
        
        expect(JSON.stringify(res._id)).to.equal(JSON.stringify(contactId));
    });
});


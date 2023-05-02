require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    mongoose.models = {}
    mongoose.modelSchemas = {}
    mongoose.connection.close()
    done()
})

const SAMPLE_OBJECT_ID = 'aaaaaaaaaaaa'

describe('Message API endpoints', () => {
    beforeEach(async () => {
        try {
            // add any beforeEach code here
            const sampleUser = new User({
                username: 'myuser',
                password: 'mypassword',
                _id: SAMPLE_OBJECT_ID
            })
            const sampleMessage = new Message({
                _id: SAMPLE_OBJECT_ID,
                title: 'mytitle',
                body: 'mybody',
                author: sampleUser
            })
            await sampleUser.save()
            this.userId = sampleUser._id
            await sampleMessage.save()
            this.messageId = sampleMessage._id
        } catch (err) {
            console.log(err)
        }
    })


    afterEach(async () => {
        try {
            // add any afterEach code here
            await User.deleteMany({ username: ['myuser', 'anotheruser'] })
            await Message.deleteMany({ title: ['mytitle', 'anothertitle'] })
        } catch (err) {
            console.log(err)
        }
    })


    it('should load all messages', (done) => {
        chai.request(app)
            .get('/messages')
            .end((err, res) => {
                if (err) { done(err) }
                expect(res).to.have.status(200)
                expect(res.body.messages).to.be.an("array")
                done()
            })
    })

    it('should get one specific message', (done) => {
        chai.request(app)
            .get(`/messages/${SAMPLE_OBJECT_ID}`)
            .end((err, res) => {
                if (err) { done(err) }
                expect(res).to.have.status(200)
                expect(res.body).to.be.an("object")
                expect(res.body.message.title).to.equal('mytitle')
                expect(res.body.message.body).to.equal('mybody')
                expect(res.body.message.author).to.equal(String(this.userId))
                done()
            })
    })

    it('should post a new message', (done) => {
        chai.request(app)
            .post(`/messages`)
            .send({ title: 'anothertitle', body: 'anotherbody', author: this.userId })
            .end((err, res) => {
                if (err) { done(err) }
                expect(res.body.message).to.be.an("object")
                expect(res.body.message).to.have.property('title', 'anothertitle')
                expect(res.body.message).to.have.property('body', 'anotherbody')
                expect(res.body.message).to.have.property('author', String(this.userId))

                Message.findOne({ title: 'anothertitle' })
                    .then(message => {
                        expect(message).to.be.an("object")
                        expect(message).to.have.property('title', 'anothertitle')
                        expect(message).to.have.property('body', 'anotherbody')
                        done()
                    })
                    .catch(err => {
                        done(err)
                    })
            })
    })

    it('should update a message', (done) => {
        chai.request(app)
            .put(`/messages/${SAMPLE_OBJECT_ID}`)
            .send({ title: 'anothertitle', body: 'anotherbody', author: this.userId })
            .end((err, res) => {
                if (err) { done(err) }
                expect(res.body.message).to.be.an("object")
                expect(res.body.message).to.have.property('title', 'anothertitle')
                expect(res.body.message).to.have.property('body', 'anotherbody')
                expect(res.body.message).to.have.property('author', String(this.userId))

                Message.findOne({ title: 'anothertitle' })
                    .then(message => {
                        expect(message).to.be.an("object")
                        expect(message).to.have.property('title', 'anothertitle')
                        expect(message).to.have.property('body', 'anotherbody')
                        done()
                    })
                    .catch(err => {
                        done(err)
                    })
            })
    })

    it('should delete a message', (done) => {
        chai.request(app)
            .delete(`/messages/${SAMPLE_OBJECT_ID}`)
            .end((err, res) => {
                if (err) { done(err) }
                expect(res.body.message).to.equal('Successfully deleted.')
                expect(res.body._id).to.equal(SAMPLE_OBJECT_ID)

                Message.findOne({ title: 'mytitle' })
                    .then(message => {
                        expect(message).to.equal(null)
                        done()
                    })
                    .catch(err => {
                        done(err)
                    })
            })
    })
})

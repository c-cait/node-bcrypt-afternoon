const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res) => {
        const { username, password, isAdmin } = req.body;
        const db = req.app.get('db');

        //this query checks the databse to see if the username is already taken
        //use await to ensure the promise is resolved before the rest of the code executes
        const result = await db.get_user(username);
        console.log('result', result)
        
        //because SQL queries come back in an array we take the first item of the array & set to existingUser
        const existingUser = result[0];
        console.log('e user', existingUser)
        if (existingUser){
            return res.status(409).send('Username taken');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const registeredUser = await db.register_user([isAdmin, username, hash]);

        //this is our newly created user object
        const user = registeredUser[0];
        console.log('registered user', user)
        

        req.session.user = { isAdmin: user.is_admin, username: user.username, id: user.id };

        return res.status(201).send(req.session.user);
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        const db = req.app.get('db');

        //we will search the db for a user that exists with the username entered
        const foundUser = await db.get_user(username);
        const user = foundUser[0]

        if(!user){
            return res.status(401).send('User not found. Please register as a new user before logging in.')
        }

        //compare the password entered by user at login to the hashed and salted version stored in the db
        const isAuthenticated = bcrypt.compareSync(password, user.hash)

        if(!isAuthenticated){
            return res.status(403).send('Incorrect password')
        }

        req.session.user = { isAdmin: user.is_admin, username: user.username, id: user.id }

        return res.status(200).send(req.session.user)


    },

    logout: (req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    }
}
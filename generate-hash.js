const bcrypt = require('bcrypt');

const password = 'reservaSanLuis';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(`Hash para "${password}":`, hash);
});

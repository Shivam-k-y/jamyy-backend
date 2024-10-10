
//  Adding JWT TOKEN generator whenever called by the Client
import jwt from 'jsonwebtoken';

// TO Block the user we need to block a primary key (they can relogin by another user id)
const generate_token = (user_id, res) => {
    const token = jwt.sign({ user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });

    // Change the params as per requirement
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 3600000 });
}



export default generate_token;
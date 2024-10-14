
//  Adding JWT TOKEN generator whenever called by the Client
import jwt from 'jsonwebtoken';

// TO Block the user we need to block a primary key (they can relogin by another user id)
const generate_token = (user_id) => {
    const token = jwt.sign({ user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return token;

    // Change the params as per requirement
   
}



export default generate_token;
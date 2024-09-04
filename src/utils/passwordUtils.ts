import { hash, genSalt} from 'bcrypt';

export const hashPassword = async (password: string) => {
   return hash(password, 10, (err, hash) => {
        if(err) throw new Error(err.message);
        return hash;
    })
}
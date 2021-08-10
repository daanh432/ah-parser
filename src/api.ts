import express from "express";
import { sign, verify } from 'jsonwebtoken';
import moment from "moment";
import { resolve } from "path";
import { Mysql } from "./datasources/Mysql";
import DataInJwtToken from "./helpers/DataInJwtToken";
import RequestWithUser from "./helpers/RequestWithUser";
import { User } from "./models/User";

const REGISTER_ENABLED = true;

export class Api {
    private static accessTokenSecret: string;
    private app: express.Application

    constructor(accessTokenSecret: string) {
        Api.accessTokenSecret = accessTokenSecret;
        this.app = express();

        this.app.use(express.urlencoded());
        this.app.use(express.json());
        this.app.use(express.static(resolve(__dirname + '/../www/dist')));

        this.app.get('/api/v1/fetch', this.authenticateJWT, async (reqRaw, res) => {
            const req: RequestWithUser = reqRaw as RequestWithUser;
            res.send({data: await req.user.getPakbons(), success: true});
        });

        this.app.get('/api/v1/fetch/:id', this.authenticateJWT, async (reqRaw, res) => {
            const req: RequestWithUser = reqRaw as RequestWithUser;
            if (req.params.id == null) {
                res.status(400).send({success: false, message: "Invalid request"});
                return;
            }

            Mysql.getPakbonById(Number.parseInt(req.params.id)).then(pakbon => {
                if (!pakbon || pakbon.getFromEmail() !== req.user.getEmail()) {
                    res.status(404).send({success: false, message: 'Not found'});
                    return;
                }
    
                res.send({data: pakbon, success: true});
                return;
            }).catch(err => {
                console.error(err);
                res.status(500).send({success: false, message: 'Internal server error'});
                return;
            });
        });

        this.register();
        this.authentication();

        this.app.get('*', (req, res) => {
            res.sendFile(resolve(__dirname + '/../www/dist/index.html'));
        })        
    }

    private authenticateJWT(reqRaw: RequestWithUser| express.Request, res: express.Response, next: express.NextFunction) {
        const req: RequestWithUser = reqRaw as RequestWithUser;
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const authHeaderSplit = authHeader.split(' ');
            if (authHeaderSplit.length >= 2) {
                const token: string = `${authHeaderSplit[1]}`;

                verify(token, Api.accessTokenSecret, (err, jwtPayload) => {
                    if (err) {
                        res.status(403).send({success: false, message: 'Forbidden'});;
                        return;
                    }                    

                    const userPayload = jwtPayload as DataInJwtToken;
                    Mysql.getUserById(userPayload.id).then((user) => {
                        if (user == null) {
                            res.status(401).send({success: false, message: 'Unauthenticated'});
                            return;
                        }

                        req.user = user;
                        next();
                        return;
                    }).catch(err => {
                        console.error(err);
                        res.status(500).send({success: false, message: 'Internal server error'});
                        return;
                    })
                    return;
                });
                return;
            }
        }

        res.status(401).send({success: false, message: 'Unauthenticated'});
    }

    private register(): void {
        if (!REGISTER_ENABLED) return;
        this.app.post('/api/v1/register', (req, res) => {
            const name: string | undefined = req.body.name;
            const email: string | undefined = req.body.email;
            const password: string | undefined = req.body.password;
            const confirm_password: string | undefined = req.body.confirm_password;

            if (name == null || email == null || password == null || confirm_password == null || (password != confirm_password)) {
                res.status(400).send({success: false, message: 'Invalid request'});
                return;
            }

            Mysql.getUserByEmail(email).then((user) => {
                if (user != null) {
                    res.status(400).send({success: false, message: 'Already registered'});
                    return;
                }

                const newUser = new User(null, name, email, password);
                Mysql.storeUser(newUser);
                res.send({success: true, message: 'Registered succesfully'});
                return;
            }).catch(err => {
                console.error(err);
                res.status(500).send({success: false, message: 'Internal server error'});
                return;
            });
        });
    }

    private authentication(): void {
        this.app.post('/api/v1/login', (req, res) => {
            const email: string | undefined = req.body.email;
            const password: string | undefined = req.body.password;

            if (email == null || password == null) {
                res.status(400).send({success: false, message: 'Invalid request'});
                return;
            }

            Mysql.getUserByEmail(email).then((user) => {
                if (user != null && user.checkPassword(password)) {
                    const expiresIn = 60*60*2;
                    const expiresAt = moment().add(expiresIn, 'seconds').unix();
                    const dataInToken: DataInJwtToken = { id: user.getId(), name: user.getName() };
                    const accessToken = sign(dataInToken, Api.accessTokenSecret, { expiresIn });
                    res.json({ success: true, accessToken, expiresIn, expiresAt });
                    return;
                }
                res.status(401).send({success: false, message: 'Username or password incorrect'});
                return;
            }).catch(err => {
                console.error(err);
                res.status(500).send({success: false, message: 'Internal server error'});
                return;
            });
        });
    }

    public start(port: string | number): void {
        this.app.listen(port);
    }
}
import express from "express";
import { User } from "../models/User";

export default interface RequestWithUser extends express.Request {
    user: User;
}
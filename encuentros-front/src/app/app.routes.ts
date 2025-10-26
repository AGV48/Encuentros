import { Routes } from '@angular/router';
import { Login } from './fearues/pages/login/login';
import { SignUp } from './fearues/pages/sign-up/sign-up';
import { Home } from './fearues/pages/home/home';
import { Chats } from './fearues/pages/chats/chats';
import { Account } from './fearues/pages/account/account';
import { Notifications } from './fearues/pages/notifications/notifications';
import { Search } from './fearues/pages/search/search';

export const routes: Routes = [
    {
        path:"",
        component: Login,
        pathMatch:"full"
    },
    {
        path:"sign-up",
        component: SignUp,
        pathMatch:"full"
    },
     {
        path:"home",
        component: Home,
        pathMatch:"full"
    },
    {
        path: "chats",
        component: Chats,
        pathMatch: "full"
    },
    {
        path: "account",
        component: Account,
        pathMatch: "full"
    },
    {
        path: "notifications",
        component: Notifications,
        pathMatch: "full"
    }
    ,
    {
        path: "search",
        component: Search,
        pathMatch: "full"
    }
];

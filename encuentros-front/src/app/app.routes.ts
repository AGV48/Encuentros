import { Routes } from '@angular/router';
import { Login } from './fearues/pages/login/login';
import { SignUp } from './fearues/pages/sign-up/sign-up';
import { Home } from './fearues/pages/home/home';
import { Chats } from './fearues/pages/chats/chats';
import { ChatDetail } from './fearues/pages/chat-detail/chat-detail';
import { Account } from './fearues/pages/account/account';
import { Notifications } from './fearues/pages/notifications/notifications';
import { Search } from './fearues/pages/search/search';
import { Budgets } from './fearues/pages/budgets/budgets';
import { Pockets } from './fearues/pages/pockets/pockets';
import ContributionsComponent from './fearues/pages/contributions/contributions';
import { Costs } from './fearues/pages/costs/costs';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    pathMatch: 'full',
  },
  {
    path: 'sign-up',
    component: SignUp,
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
    pathMatch: 'full',
  },
  {
    path: 'chats',
    component: Chats,
    pathMatch: 'full',
  },
  {
    path: 'chat-detail/:id',
    component: ChatDetail,
    pathMatch: 'full',
  },
  {
    path: 'account',
    component: Account,
    pathMatch: 'full',
  },
  {
    path: 'notifications',
    component: Notifications,
    pathMatch: 'full',
  },
  {
    path: 'search',
    component: Search,
    pathMatch: 'full',
  },
  {
    path: 'budgets',
    component: Budgets,
    pathMatch: 'full',
  },
  {
    path: 'budgets/:id',
    component: Budgets,
    pathMatch: 'full',
  },
  {
    path: 'pockets',
    component: Pockets,
    pathMatch: 'full',
  },
  {
    path: 'pockets/:id',
    component: Pockets,
    pathMatch: 'full',
  },
  {
    path: 'contributions',
    component: ContributionsComponent,
    pathMatch: 'full',
  },
  {
    path: 'contributions/:id',
    component: ContributionsComponent,
    pathMatch: 'full',
  },
  {
    path: 'costs',
    component: Costs,
    pathMatch: 'full',
  },
  {
    path: 'costs/:id',
    component: Costs,
    pathMatch: 'full',
  },
];

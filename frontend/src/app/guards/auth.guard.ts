import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from "../services/auth.service";
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // allow user to continue navigating to page if authenticated
  if (auth.isLoggedIn()) {
    return true;
  }

  // otherwise, redirect to login
  router.navigate(['/login']);
  return false;
};

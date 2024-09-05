import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth.service";

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // allow user to continue navigating to page if authenticated
  if (!auth.isSuperAdmin()) {
    // otherwise, redirect to dashboard
    router.navigate(['/']);
    return false;
  }
  return true;
};

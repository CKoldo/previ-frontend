import { HttpInterceptorFn } from '@angular/common/http';

function isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
}

function redirectToSignIn() {
  localStorage.removeItem('access_token');
  window.location.href = '/auth/sign-in';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('seguridad/token')) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');

  if (!token) {
    return next(req);
  }

  if (!token) {
    console.warn('No token found in localStorage');
    redirectToSignIn();
    return next(req);
  }

  if (isTokenExpired(token)) {
    redirectToSignIn();
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(clonedRequest);
};

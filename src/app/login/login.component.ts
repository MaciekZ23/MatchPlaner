import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  SocialUser,
  SocialAuthService,
  GoogleLoginProvider,
  GoogleSigninButtonModule,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { stringsLogin } from './misc';

@Component({
  selector: 'app-login',
  imports: [CommonModule, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
})
export class LoginComponent {
  moduleStrings = stringsLogin;
  // user: SocialUser | null = null;

  // constructor(private authService: SocialAuthService, private router: Router) {
  //   this.authService.authState.subscribe((user) => {
  //     this.user = user;
  //     if (user) {
  //       localStorage.setItem('token', user.idToken);
  //       this.router.navigate(['/']);
  //     }
  //   });
  // }

  // signInWithGoogle(): void {
  //   this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  // }

  // signOut(): void {
  //   this.authService.signOut();
  //   localStorage.removeItem('token');
  // }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log("Profile: ");
    
    console.log(JSON.parse(localStorage.getItem('profile')||'{}'))
    console.log("Token: ");
    console.log(localStorage.getItem('auth_token') || null);
    console.log("Refresh Token: ")
    console.log(localStorage.getItem('ref_token') || null);
    
    
  }

}

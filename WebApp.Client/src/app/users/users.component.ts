import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule } from 'ng-zorro-antd/message';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [
    {
      id: 1,
      username: 'admin',
      fullName: 'Administrator',
      email: 'admin@example.com',
      role: 'Admin',
      status: true
    },
    {
      id: 2,
      username: 'user1',
      fullName: 'Nguyễn Văn A',
      email: 'user1@example.com',
      role: 'User',
      status: true
    }
  ];

  isModalVisible = false;
  editingUser: User | null = null;

  constructor() { }

  ngOnInit(): void {
    // TODO: Load users from API
  }

  showAddModal(): void {
    this.editingUser = null;
    this.isModalVisible = true;
  }

  showEditModal(user: User): void {
    this.editingUser = { ...user };
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  handleOk(): void {
    if (this.editingUser) {
      if (this.editingUser.id) {
        // Update existing user
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
          this.users[index] = { ...this.editingUser };
        }
      } else {
        // Add new user
        const newUser = {
          ...this.editingUser,
          id: Math.max(...this.users.map(u => u.id)) + 1
        };
        this.users = [...this.users, newUser];
      }
    }
    this.isModalVisible = false;
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }
}

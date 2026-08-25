<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'ADMIN';
    case Student = 'STUDENT';
    case Instructor = 'INSTRUCTOR';
}

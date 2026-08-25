<?php

namespace App\Enums;

enum CourseStatus: string
{
    case Draft = 'DRAFT';
    case Published = 'PUBLISHED';
}

import { SetMetadata } from '@nestjs/common';

export const AUTHORITIES_KEY = 'authorities';
export const Authorities = (...authorities: string[]) =>
    SetMetadata(AUTHORITIES_KEY, authorities);
/**
 * Email creation response object.
 */
export interface EmailResponse{
    status : 'success' | 'failed';
    error : string | null;
}
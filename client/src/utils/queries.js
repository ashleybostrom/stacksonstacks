import { gql } from '@apollo/client';
// mutation to get a user
export const GET_USER = gql`
    query user($email: String!) {
        user(email: $email) {
            _id
            username
            email
            savedBooks {
                _id
                authors
                title
                description
                bookId
                image
                link
            }
        }
    }
`;

// mutation to get me
export const GET_ME = gql`
    {
        me {
            _id
            username
            email
            savedBooks {
                _id
                authors
                title
                description
                bookId
                image
                link
            }
        }
    }
`;
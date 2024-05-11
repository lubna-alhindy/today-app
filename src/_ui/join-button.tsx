// import React from 'react';
// import { useMutation } from '@apollo/client';
// import gql from 'graphql-tag';

// interface MyButtonProps {
//   collectionId: string;
// }

// const MY_MUTATION = gql`
//   mutation MyMutation($collectionId: ID!) {
//     // Define your mutation here
//   }
// `;

// const MyButton: React.FC<MyButtonProps> = ({ collectionId }) => {
//   const [myMutation] = useMutation(MY_MUTATION);

//   const handleClick = async () => {
//     try {
//       await myMutation({
//         variables: {
//           collectionId: collectionId,
//         },
//       });
//       console.log('Mutation executed successfully');
//       // Optionally, you can perform additional actions after the mutation
//     } catch (error) {
//       console.error('Error executing mutation:', error);
//     }
//   };

//   return (
//     <button onClick={handleClick}>Call Mutation</button>
//   );
// };

// export default MyButton;
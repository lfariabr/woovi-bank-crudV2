import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { Box, Paper, Typography, Divider } from '@mui/material';
// Adjust the import path as needed for your generated types
import { AllAccountsList_query$key } from '../../__generated__/AllAccountsList_query.graphql';

type Props = {
  query: AllAccountsList_query$key;
  currentUserAccountId: string;
  showOnlyUserAccount?: boolean;
};

export const AllAccountsList: React.FC<Props> = ({ query, currentUserAccountId, showOnlyUserAccount }) => {
  const data = useFragment(
    graphql`
      fragment AllAccountsList_query on Query
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 100 }
        after: { type: "String" }
      ) {
        allAccounts(first: $first, after: $after) {
          edges {
            node {
              id
              accountId
              first_name
              last_name
              balance
              taxId
              createdAt
              isActive
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    query
  );

  if (!data?.allAccounts?.edges?.length) {
    return <Typography>No accounts found.</Typography>;
  }

  return (
    <Box>
      {data.allAccounts.edges.map((edge) =>
        edge?.node ? (
          <Paper key={edge.node.id} sx={{ mb: 2, p: 2 }}>
            <Typography variant="body1" gutterBottom>
              Account name: {edge.node.first_name} {edge.node.last_name}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Account ID: {edge.node.accountId}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Balance: ${Number(edge.node.balance) / 100}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Tax ID: {edge.node.taxId}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Created: {edge.node.createdAt}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Status: {edge.node.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Paper>
        ) : null
      )}
    </Box>
  );
};
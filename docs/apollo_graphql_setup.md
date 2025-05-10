# Apollo GraphQL Subscription Setup

This will walk you through setting up your local GraphQL server with Apollo Studio using **Rover CLI**.

---

## Prerequisites
- Make sure you have Node.js installed.
- Have your GraphQL server running locally (e.g., on `http://localhost:4000/graphql`).

---

## Installation

### Install Rover CLI
To install Rover globally, run:
```bash
npm install -g @apollo/rover
```

For more information on Apollo Rover, check out:
- [Apollo Studio](https://studio.apollographql.com/)
- [GraphQL Setup Guide](https://www.apollographql.com/docs/guides/graphql/setup)
- [Apollo Studio Community GitHub](https://github.com/apollographql/apollo-studio-community?tab=readme-ov-file)

---

## Set Up API Key

Export your Apollo API key as an environment variable:
```bash
export APOLLO_KEY=service:Dev-yuwsdx:<KEY>
```
Replace `<KEY>` with your actual API key from Apollo Studio.

---

## Fetching the GraphQL Schema

Use `curl` to fetch the schema from your local server:
```bash
curl http://localhost:4000/graphql -o schema.graphql
```

Check the schema file to ensure it was downloaded correctly:
```bash
cat schema.graphql
```

---

## Publishing Your Subgraph to Apollo Studio

Run the following command to publish your schema:
```bash
rover subgraph publish Dev-yuwsdx@current   --name local-graphql   --schema ./schema.graphql   --routing-url http://localhost:4000/graphql
```

**Note:** You might be prompted with:
```
The host `localhost` is not routable via the public internet.
Continuing the publish will make this subgraph reachable in local environments only.
Would you still like to publish? [y/N]
```
Type **`y`** to confirm.

---

## Apollo Studio Settings

### Connection Settings:
- **HTTP Endpoint:**  
  ```
  http://localhost:4000/graphql
  ```

### Subscription Endpoint:
- **WebSocket (WS) URL:**  
  ```
  ws://localhost:4000/graphql/ws
  ```

---

## Success

You should now see your subgraph published in Apollo Studio!  
Visit the dashboard to monitor and interact with your subscriptions as you send mutations, they should be published to the dashboard!

Happy GraphQL-ing! 

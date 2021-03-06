const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLList,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const pantheons = [
  { pantheon_id: 1, name: "Olympians" },
  { pantheon_id: 2, name: "Titans" },
];

const gods = [
  { id: 1, name: "Zeus", pantheon_id: 1 },
  { id: 2, name: "Posideon", pantheon_id: 1 },
  { id: 3, name: "Hades", pantheon_id: 1 },
  { id: 4, name: "Hera", pantheon_id: 1 },
  { id: 5, name: "Aphrodite", pantheon_id: 1 },
  { id: 6, name: "Cronus", pantheon_id: 2 },
  { id: 7, name: "Atlas", pantheon_id: 2 },
  { id: 8, name: "Eos", pantheon_id: 2 },
];

const app = express();

const PORT = 5000 || process.env.PORT;

const PantheonType = new GraphQLObjectType({
  name: "Pantheon",
  description: "This represents a pantheon",
  fields: () => ({
    pantheon_id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    gods: {
      type: new GraphQLList(GodType),
      resolve: (pantheon) => {
        return gods.filter((god) => god.pantheon_id === pantheon.pantheon_id);
      },
    },
  }),
});

const GodType = new GraphQLObjectType({
  name: "God",
  description: "This represents a god",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    pantheon_id: { type: GraphQLNonNull(GraphQLInt) },
    pantheon: {
      type: PantheonType,
      resolve: (god) => {
        return pantheons.find(
          (pantheon) => pantheon.pantheon_id === god.pantheon_id
        );
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    god: {
      type: GodType,
      description: "A single god",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => gods.find((god) => god.id === args.id),
    },
    gods: {
      type: new GraphQLList(GodType),
      description: "List of All Gods",
      resolve: () => gods,
    },
    pantheons: {
      type: new GraphQLList(PantheonType),
      description: "List of All Pantheons",
      resolve: () => pantheons,
    },
    pantheon: {
      type: PantheonType,
      description: "A Single Pantheon",
      //Used id instead of pantheon_id beacuse i wanted the api to just ref
      args: {
        pantheon_id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        pantheons.find((pantheon) => pantheon.pantheon_id === args.pantheon_id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addGod: {
      type: GodType,
      description: "Add a God",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        pantheon_id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const god = {
          id: gods.length + 1,
          name: args.name,
          pantheon_id: args.pantheon_id,
        };

        gods.push(god);
        return god;
      },
    },
    addPantheon: {
      type: PantheonType,
      description: "Add a Pantheon",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const pantheon = {
          pantheon_id: pantheons.length + 1,
          name: args.name,
        };

        pantheons.push(pantheon);
        return pantheon;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => console.log("server is running..."));

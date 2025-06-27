
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    walletAddress: String
    complianceStatus: ComplianceStatus!
    fbtBalance: Float!
    stakedAmount: Float!
    phoneNumber: String
    profileImage: String
    location: Location
    preferences: UserPreferences
    driverProfile: DriverProfile
    merchantProfile: MerchantProfile
    createdAt: Date!
    updatedAt: Date!
  }

  enum UserRole {
    CUSTOMER
    DRIVER
    MERCHANT
    ADMIN
  }

  enum ComplianceStatus {
    VERIFIED
    PENDING
    SUSPENDED
  }

  type Location {
    address: String
    coordinates: [Float!]
  }

  type UserPreferences {
    dietaryRestrictions: [String!]
    cuisinePreferences: [String!]
    notifications: NotificationPreferences!
  }

  type NotificationPreferences {
    email: Boolean!
    sms: Boolean!
    push: Boolean!
  }

  type DriverProfile {
    vehicleType: String
    licenseNumber: String
    insurance: String
    rating: Float!
    earnings: Float!
    hoursWorked: Float!
    completedOrders: Int!
    benefits: [String!]
    guaranteedWage: Float!
    lastBackgroundCheck: Date
  }

  type MerchantProfile {
    businessName: String
    businessLicense: String
    taxId: String
    subscriptionStatus: SubscriptionStatus!
    subscriptionTier: SubscriptionTier!
  }

  enum SubscriptionStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  enum SubscriptionTier {
    BASIC
    PREMIUM
    ENTERPRISE
  }

  type Restaurant {
    id: ID!
    name: String!
    cuisine: String!
    rating: Float!
    deliveryTime: String!
    deliveryFee: Float!
    image: String!
    verified: Boolean!
    ethicalScore: Int!
    categories: [String!]!
    menu: [MenuItem!]!
    licenseVerified: Boolean!
    healthRating: Float!
    location: Location!
    subscriptionStatus: SubscriptionStatus!
    ownerId: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type MenuItem {
    id: ID!
    name: String!
    price: Float!
    description: String!
    category: String!
    allergens: [String!]
    nutritionalInfo: NutritionalInfo
    available: Boolean!
  }

  type NutritionalInfo {
    calories: Int
    protein: Int
    carbs: Int
    fat: Int
    fiber: Int
    sodium: Int
  }

  type Order {
    id: ID!
    customerId: String!
    customer: User!
    restaurantId: String!
    restaurant: Restaurant!
    driverId: String
    driver: User
    items: [OrderItem!]!
    total: Float!
    status: OrderStatus!
    estimatedDelivery: Date
    deliveryAddress: DeliveryAddress!
    paymentMethod: PaymentMethod!
    paymentStatus: PaymentStatus!
    blockchainTx: String
    ethicalImpact: String
    aiRecommendation: AIRecommendation
    securityChecks: [SecurityCheck!]!
    temperatureLogs: [TemperatureLog!]!
    createdAt: Date!
    updatedAt: Date!
  }

  type OrderItem {
    menuItemId: String!
    name: String!
    quantity: Int!
    price: Float!
    specialInstructions: String
  }

  type DeliveryAddress {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    coordinates: [Float!]!
    instructions: String
  }

  type AIRecommendation {
    suggestedItems: [String!]!
    estimatedPrepTime: Int!
    optimalRoute: String!
    confidenceScore: Float!
  }

  type SecurityCheck {
    name: String!
    passed: Boolean!
    timestamp: Date!
    details: String
  }

  type TemperatureLog {
    time: Date!
    temp: Float!
    location: String
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PREPARING
    READY
    ASSIGNED
    PICKED_UP
    IN_TRANSIT
    DELIVERED
    CANCELLED
  }

  enum PaymentMethod {
    FIAT
    CRYPTO
  }

  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  # Input types
  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: UserRole
    phoneNumber: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateOrderInput {
    restaurantId: String!
    items: [OrderItemInput!]!
    deliveryAddress: DeliveryAddressInput!
    paymentMethod: PaymentMethod!
    specialInstructions: String
  }

  input OrderItemInput {
    menuItemId: String!
    quantity: Int!
    specialInstructions: String
  }

  input DeliveryAddressInput {
    street: String!
    city: String!
    state: String!
    zipCode: String!
    coordinates: [Float!]!
    instructions: String
  }

  input UpdateProfileInput {
    name: String
    phoneNumber: String
    profileImage: String
    location: LocationInput
    preferences: UserPreferencesInput
  }

  input LocationInput {
    address: String
    coordinates: [Float!]
  }

  input UserPreferencesInput {
    dietaryRestrictions: [String!]
    cuisinePreferences: [String!]
    notifications: NotificationPreferencesInput
  }

  input NotificationPreferencesInput {
    email: Boolean
    sms: Boolean
    push: Boolean
  }

  # Query types
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(role: UserRole, limit: Int, offset: Int): [User!]!

    # Restaurant queries
    restaurant(id: ID!): Restaurant
    restaurants(
      cuisine: String
      category: String
      location: [Float!]
      radius: Float
      verified: Boolean
      limit: Int
      offset: Int
    ): [Restaurant!]!
    searchRestaurants(query: String!, limit: Int): [Restaurant!]!

    # Order queries
    order(id: ID!): Order
    myOrders(status: OrderStatus, limit: Int, offset: Int): [Order!]!
    ordersByRestaurant(restaurantId: String!, status: OrderStatus): [Order!]!
    ordersByDriver(driverId: String!, status: OrderStatus): [Order!]!

    # Driver queries
    nearbyDrivers(coordinates: [Float!]!, radius: Float!): [User!]!
    availableDrivers: [User!]!

    # Analytics
    orderAnalytics(period: String!): JSON
    driverAnalytics(driverId: String!, period: String!): JSON
    restaurantAnalytics(restaurantId: String!, period: String!): JSON
  }

  # Mutation types
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    refreshToken(refreshToken: String!): AuthPayload!

    # Profile management
    updateProfile(input: UpdateProfileInput!): User!
    updateWalletAddress(address: String!): User!
    verifyPhone(code: String!): Boolean!

    # Order management
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!
    assignDriver(orderId: ID!, driverId: String!): Order!
    cancelOrder(orderId: ID!, reason: String): Order!

    # Driver operations
    updateDriverLocation(coordinates: [Float!]!): Boolean!
    toggleDriverAvailability: Boolean!
    acceptOrder(orderId: ID!): Order!
    completeOrder(orderId: ID!): Order!

    # Payment operations
    createPaymentIntent(orderId: ID!, paymentMethod: PaymentMethod!): PaymentIntent!
    confirmPayment(paymentIntentId: String!): PaymentResult!

    # Web3 operations
    stakeFBT(amount: Float!): Boolean!
    unstakeFBT: Boolean!
    claimRewards: Float!

    # Admin operations
    updateUserComplianceStatus(userId: ID!, status: ComplianceStatus!): User!
    suspendUser(userId: ID!, reason: String!): User!
    verifyRestaurant(restaurantId: ID!): Restaurant!
  }

  # Subscription types
  type Subscription {
    orderUpdated(orderId: ID): Order!
    driverLocationUpdated(driverId: ID): Location!
    newOrder(restaurantId: ID): Order!
    paymentStatusUpdated(orderId: ID): Order!
  }

  type AuthPayload {
    success: Boolean!
    user: User
    token: String
    refreshToken: String
    message: String
  }

  type PaymentIntent {
    id: ID!
    clientSecret: String
    amount: Float!
    currency: String!
    status: String!
  }

  type PaymentResult {
    success: Boolean!
    transactionId: String
    blockchainTx: String
    message: String
  }
`;

export const resolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    },

    restaurants: async (parent: any, args: any, context: any) => {
      // Implementation would query restaurant database
      return [];
    },

    myOrders: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      // Implementation would query orders database
      return [];
    },
  },

  Mutation: {
    register: async (parent: any, args: any, context: any) => {
      // Implementation would handle user registration
      return { success: false, message: 'Not implemented' };
    },

    login: async (parent: any, args: any, context: any) => {
      // Implementation would handle user login
      return { success: false, message: 'Not implemented' };
    },

    createOrder: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      // Implementation would create new order
      return {};
    },
  },

  Subscription: {
    orderUpdated: {
      subscribe: () => {
        // Implementation would set up subscription
      }
    }
  }
};

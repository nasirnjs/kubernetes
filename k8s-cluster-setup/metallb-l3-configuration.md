
## MetalLB BGP Configuration

## Border Gateway Protocol (BGP) Overview

**BGP (Border Gateway Protocol)** is a critical component of the Internet's infrastructure. It's a protocol designed to exchange routing information between different networks, known as Autonomous Systems (ASes). An AS is essentially a large network or group of networks that are under a single administrative control. The primary purpose of BGP is to ensure that data packets can be routed efficiently across the complex and expansive landscape of interconnected networks that make up the Internet.

## Key Functions of BGP

1. **Routing Information Exchange**: BGP allows ASes to share information about which IP prefixes (blocks of IP addresses) they can reach. This helps in determining the best paths for data to travel across different networks.
2. **Path Selection**: BGP enables the selection of the most efficient routes for data to travel from one AS to another, based on various attributes such as path length, policies, and network performance.
3. **Loop Prevention**: By using path attributes, BGP helps prevent routing loops, which can cause data packets to be transmitted in circles and never reach their destination.
4. **Policy Enforcement**: BGP allows network administrators to implement policies that govern how routing decisions are made. This includes preferring certain paths over others based on business agreements, security considerations, or performance metrics.


## Types of BGP: iBGP and eBGP

### Internal BGP (iBGP)

- **Usage**: iBGP is used within a single AS to ensure consistent routing information among routers.
- **Function**: Routers within the same AS use iBGP to communicate about the best routes available. This ensures all routers within the AS have a consistent view of the network.
- **Characteristics**:
  - Routers must establish peering relationships with all other iBGP routers within the AS.
  - iBGP does not alter the next-hop attribute, preserving the original source of the routing information.

### External BGP (eBGP)

- **Usage**: eBGP is used to exchange routing information between different ASes.
- **Function**: ISPs and large organizations use eBGP to communicate with each other and share routing information, facilitating the flow of data across the global Internet.
- **Characteristics**:
  - Routers in different ASes establish eBGP sessions, typically directly connected or through specific routing paths.
  - eBGP updates generally modify the next-hop attribute to indicate the source AS.

## BGP Configuration
MetalLB needs to be instructed on how to establish a session with one or more external BGP routers. In order to do so, an instance of BGPPeer must be created for each router we want metallb to connect to. For a basic configuration featuring one BGP router and one IP address range, you need 4 pieces of information.

- The router IP address that MetalLB should connect to,
- The router’s AS number,
- The AS number MetalLB should use,
- An IP address range expressed as a CIDR prefix.
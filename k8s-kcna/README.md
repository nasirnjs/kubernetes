

**1.What is Cloud Native Computing Foundation (CNCF)?**\
The Cloud Native Computing Foundation (CNCF) is an open-source software foundation that aims to make cloud native computing ubiquitous. It fosters the adoption of cloud native technologies by promoting a wide range of open-source projects that enable scalable, resilient, and manageable applications in dynamic environments like public, private, and hybrid clouds. CNCF operates with a strong emphasis on neutrality, openness, and platform agnosticism, ensuring that its projects are accessible, reliable, and free from partisan influence. The foundation supports and sustains an ecosystem of technologies, guiding their development and promoting best practices in cloud native computing.

[References](https://github.com/cncf/foundation/blob/main/charter.md)


**2.Characteristics of Cloud Native Applications?**\
Cloud Native Applications harness the power of the cloud to provide increased resilience, agility, operability, and observability. Let's dive a bit deeper into these characteristics.

Resiliency: 
Resilient applications are designed to withstand failures and continue to function or recover quickly. They typically make use of patterns such as redundancy, failover, and graceful degradation. Self-healing, where systems automatically detect and recover from failure, is a key aspect of resilient cloud-native applications. Kubernetes, for instance, has a built-in self-healing mechanism where it maintains a desired number of pod replicas and replaces failed instances.

Agility: 
Agility in the context of cloud-native applications refers to the ability to quickly build, modify, and deploy applications. Agile practices such as microservices and continuous delivery pipelines, backed by automation, promote rapid iteration and responsiveness to change.

Operability: 
Operability encompasses the ease of deploying, running, and managing applications. Cloud-native applications are designed to be easily monitored, configured, and maintained. They typically leverage automation and Infrastructure as Code (IaC) tools like Terraform to streamline operations and minimise toil.

Observability:
Observability is the ability to understand the internal state of your system based on the outputs it generates. It's a critical component in diagnosing issues and understanding how an application behaves in the wild. Logging, monitoring, and tracing (collectively known as the 'three pillars of observability') are vital practices to understand the state and performance of cloud-native applications.

**3. Key Pillars of Cloud Native Architecture**
Building upon the characteristics and practices discussed, cloud-native architecture is sometimes referenced as being founded on four key pillars:

1.Microservices Architecture

Microservices architecture involves breaking down the application into loosely coupled, independently deployable components, each focusing on a single responsibility. This design enables agility, scalability, and resilience as each microservice can be developed, scaled, and managed independently.

2.Containerisation

Containerisation involves encapsulating an application with its dependencies into a container, which can run uniformly across different environments. It facilitates isolation, consistency, and efficiency, making applications easier to build, deploy, and manage.

3.DevOps

DevOps is a collaborative approach that combines software development (Dev) and IT operations (Ops) to enhance the efficiency, reliability, and speed of software delivery. By fostering a culture of excellence, DevOps emphasises automation, monitoring, and collaboration across development and operations teams.

4.Continuous Delivery (CD)

Continuous Delivery is a practice where code changes are automatically built, tested, and prepared for a release to production. CD accelerates the release cycle, enhances productivity, and reduces the risk, complexity, and downtime of application deployment.

In essence, building cloud-native applications is a strategy that promotes agility, resilience, operability, and observability by leveraging modern technological practices.

With a clear understanding of these characteristics and key pillars, organisations can fully exploit the advantages of cloud-native architectures.


**What is Keda in the context of Autoscaling?**\
KEDA (Kubernetes Event-Driven Autoscaling) is an open-source project that enables Kubernetes to scale applications based on the occurrence of specific events or metrics, beyond just CPU and memory usage. It acts as a Kubernetes Metrics Server that allows you to define custom metrics for scaling, making it possible to trigger autoscaling based on various external sources such as message queues, databases, or other custom metrics.
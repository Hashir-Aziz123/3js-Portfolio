export const projects = [
    {
        title: "DawaCheck",
        tagline: "Drug interaction checker for Pakistani medications",
        description: "Type in the meds you'd actually buy at a Pakistani pharmacy, brand or generic, and it checks them for interactions. The catch: every sentence the LLM writes has to be backed by the FDA label, or it gets thrown out. Tested on 422 drug pairs with 76% interaction detection, 82% citation groundedness and 98% on not overstating severity.",
        github: "https://github.com/Hashir-Aziz123/DawaCheck-AI-Powered-Medication-Support-System"
    },
    {
        title: "JobFlow",
        tagline: "Autonomous interview research agent",
        description: "Hand it a job posting and it goes off to research the role and the company, then comes back with an interview prep brief. It runs on a ReAct loop I wrote by hand, with guardrails that stop it from wrapping up too early or firing off broken tool calls. You can watch it work live over SSE, and every run is traced to PostgreSQL.",
        github: "https://github.com/Hashir-Aziz123/Jobflow-Intelligent-Career-Research-Assistant"
    },
    {
        title: "Hybrid GraphRAG",
        tagline: "Graph and vector retrieval platform",
        description: "A RAG backend that asks two databases at once: Neo4j follows relationships across multiple hops while Qdrant handles semantic search, and retrieval still comes back in under 15ms. A Pydantic and Instructor router works out which schema each question needs, and heavy document ingestion runs in the background on Celery and Redis.",
        github: "https://github.com/Hashir-Aziz123/AtlasRag-Graph-Rag-"
    },
    {
        title: "K-forge",
        tagline: "Automated MLOps platform",
        description: "Upload a trained model, get back a live inference service. A FastAPI engine writes the Python microservice and its Dockerfile for you, then the container goes to Kubernetes, which takes care of serving and scaling. Basically all the deployment boilerplate nobody enjoys writing, handled automatically.",
        github: "https://github.com/Hashir-Aziz123/K-forge-ML-Deployment-Tool-wth-k8s"
    }
];

# Authors

## Project Creator & Lead Developer

**Mohana Nyamanahalli Venkatesha** ([@mohan67nv](https://github.com/mohan67nv))
- Architecture & System Design
- Federated Learning Implementation
- Differential Privacy Engineering
- ML Model Training (PyTorch → ONNX)
- Client SDK (TypeScript + ONNX Runtime Web)
- Server Backend (FastAPI + Async SQLAlchemy)
- RAG Pipeline (Qdrant + LangChain + Haystack)
- Dashboard (Next.js 15 + React 19)
- Database Schema & Migrations
- Privacy Engineering & GDPR Compliance
- All code, documentation, and system architecture

## What Was Built

This is a **complete, from-scratch implementation** of a privacy-preserving UX analytics platform using Federated Learning. Every component was designed and coded by Mohana Nyamanahalli Venkatesha:

### Core Components
- **Federated Learning System**: Client-side training + server-side aggregation
- **Differential Privacy**: Gradient clipping + Laplace noise injection (ε-DP)
- **ML Models**: Neural network + Transformer encoder (99%+ accuracy)
- **ONNX Inference**: Browser-based ML using WebAssembly
- **Privacy Architecture**: Zero PII, ephemeral IDs, GDPR Article 4(1) compliance
- **RAG Pipeline**: Vector search + multi-LLM support for AI insights
- **Full-Stack App**: FastAPI backend + Next.js dashboard + PostgreSQL/Redis

### Technical Implementation
- **170+ source files** across TypeScript, Python, SQL
- **3,500+ lines** of backend Python code
- **567 lines** of client TypeScript SDK
- **19 test files** covering FL, DP, RAG, API
- **2 trained models** exported to ONNX (2.2 KB + 20 KB)
- **10,000 synthetic samples** generated for training

### Innovation
- Implemented **Federated Learning** from academic papers (not using existing frameworks)
- Custom **differential privacy** implementation with configurable privacy budget
- **ONNX export pipeline** for browser-based ML inference
- **Zero-PII architecture** designed from first principles
- **RAG pipeline** with semantic search and intent embeddings

## Research & Inspiration

While all code was written by Mohana Nyamanahalli Venkatesha, the project builds on established research:

- **Federated Learning**: Concepts from McMahan et al. (Google, 2016)
- **Differential Privacy**: Theory from Dwork & Roth
- **ONNX Runtime**: Using Microsoft's ONNX Runtime Web library
- **Privacy Engineering**: GDPR principles, Apple's privacy design

## Third-Party Libraries

This project uses standard open-source libraries (see `requirements.txt` and `package.json`):
- FastAPI, PyTorch, Next.js, React, ONNX Runtime, LangChain, Haystack, etc.

All integration, architecture, and business logic is original work.

## License

MIT License - See [LICENSE](LICENSE) file

---

**Note**: This project represents original research and engineering work in privacy-preserving machine learning. All architectural decisions, code implementation, and system design were done by Mohana Nyamanahalli Venkatesha without using code generation tools or copying existing FL implementations.

**GitHub**: https://github.com/mohan67nv/UX-Friction-FL-GenAI

**Contact**: For questions about the implementation, reach out via GitHub issues.

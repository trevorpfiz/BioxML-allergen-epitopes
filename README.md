# BioxML - Allergen Peptides

## Table of Contents

- [Demo](#demo)
- [Goals](#goals)
- [Overview](#overview)
  1. [Allergen selection](#1-allergen-selection)
  2. [Protein sequence retrieval and analysis](#2-protein-sequence-retrieval-and-analysis)
  3. [Physicochemical analysis and secondary structure prediction](#3-physicochemical-analysis-and-secondary-structure-prediction)
  4. [Epitope prediction](#4-epitope-prediction)
  5. [Population coverage analysis](#5-population-coverage-analysis)
  6. [Evaluate and select epitopes](#6-evaluate-and-select-epitopes)
  7. [Molecular docking of the selected epitopes](#7-molecular-docking-of-the-selected-epitopes)
  8. [Construct the T-cell epitope-based vaccine (TEV)](#8-construct-the-t-cell-epitope-based-vaccine-tev)
  9. [In silico TEV evaluation](#9-in-silico-tev-evaluation)
  10. [Molecular docking of TEV with immune receptors](#10-molecular-docking-of-tev-with-immune-receptors)
  11. [Molecular dynamics simulation](#11-molecular-dynamics-simulation)
  12. [Codon optimization and in silico cloning](#12-codon-optimization-and-in-silico-cloning)
  13. [Analyze all in silico results](#13-analyze-all-in-silico-results)
  14. [Next Steps](#14-next-steps)

## Demo

## Goals

1. Advance B-cell and T-cell epitope prediction through a web platform powered by ESM-3
2. Refine and detail the platform to empower allergy vaccine research

## Overview

### 1. Allergen selection

#### Ara h 2

### 2. Protein sequence retrieval and analysis

- Retrieve protein sequences of chosen allergen isoforms (IUIS, NCBI)

  #### Ara h 2 Isoforms

  ##### 1. Ara h 2.0101 - AAK96887

  ```bash
  >AAK96887.1 allergen II, partial [Arachis hypogaea]
  MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYERDPYSPSQD
  PYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQFKRELRNLPQQC
  GLRAPQRCDLDVESGG
  ```

  ##### 2. Ara h 2.0201 - AAN77576

  ```bash
  >AAN77576.1 allergen Ara h 2.02 [Arachis hypogaea]
  MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYGRDPYSPSQD
  PYSPSQDPDRRDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQ
  FKRELRNLPQQCGLRAPQRCDLEVESGGRDRY
  ```

- Align sequences (Clustal Omega / MEGA)

  Input:

  ```bash
  >AAK96887.1 allergen II, partial [Arachis hypogaea]
  MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYERDPYSPSQD
  PYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQFKRELRNLPQQC
  GLRAPQRCDLDVESGG
  >AAN77576.1 allergen Ara h 2.02 [Arachis hypogaea]
  MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSYGRDPYSPSQD
  PYSPSQDPDRRDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEALQQIMENQSDRLQGRQQEQQ
  FKRELRNLPQQCGLRAPQRCDLEVESGGRDRY
  ```

  Output:

  ```bash
  CLUSTAL O(1.2.4) multiple sequence alignment


  AAK96887.1      MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSY	60
  AAN77576.1      MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSY	60
                  ************************************************************

  AAK96887.1      ERDPYSPSQDP------------YSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEA	108
  AAN77576.1      GRDPYSPSQDPYSPSQDPDRRDPYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEA	120
                   **********            *************************************

  AAK96887.1      LQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLDVESGG----	156
  AAN77576.1      LQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLEVESGGRDRY	172
                  ******************************************:*****
  ```

- Create consensus sequence (EMBOSS Cons)

  ```bash
  >EMBOSS0001
  MAKLTILVALALFLLAAHASARQQWELQGDRRCQSQLERANLRPCEQHLMQKIQRDEDSY
  eRDPYSPSQDPyspsqdpdrrdpYSPSPYDRRGAGSSQHQERCCNELNEFENNQRCMCEA
  LQQIMENQSDRLQGRQQEQQFKRELRNLPQQCGLRAPQRCDLDVESGGrdry
  ```

- Find homologous sequences (BLASTp query)
- Investigate family classification (Pfam, InterPro)
- Predict transmembrane helices (DeepTMHMM)
- Conduct phylogenetic analysis (MEGA 11)

### 3. Physicochemical analysis and secondary structure prediction

### 4. Epitope prediction

### 5. Population coverage analysis

### 6. Evaluate and select epitopes

### 7. Molecular docking of the selected epitopes

### 8. Construct the T-cell epitope-based vaccine (TEV)

### 9. In silico TEV evaluation

### 10. Molecular docking of TEV with immune receptors

### 11. Molecular dynamics simulation

### 12. Codon optimization and in silico cloning

### 13. Analyze all in silico results

### 14. Next Steps

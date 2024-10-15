// This file is auto-generated by @hey-api/openapi-ts

export const ConformationalBPredictionSchema = {
  properties: {
    job_id: {
      type: "string",
      title: "Job Id",
    },
    id: {
      type: "string",
      title: "Id",
    },
    created_at: {
      type: "string",
      format: "date-time",
      title: "Created At",
    },
    updated_at: {
      type: "string",
      format: "date-time",
      title: "Updated At",
    },
    sequence: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Sequence",
    },
    pdb_id: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Pdb Id",
    },
    chain: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Chain",
    },
    is_structure_based: {
      type: "boolean",
      title: "Is Structure Based",
    },
    bcr_recognition_probability_method: {
      type: "string",
      title: "Bcr Recognition Probability Method",
    },
    surface_accessibility_method: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Surface Accessibility Method",
    },
    result: {
      items: {
        $ref: "#/components/schemas/PredictionResult",
      },
      type: "array",
      title: "Result",
    },
    csv_download_url: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Csv Download Url",
    },
  },
  type: "object",
  required: [
    "job_id",
    "id",
    "created_at",
    "updated_at",
    "is_structure_based",
    "bcr_recognition_probability_method",
    "surface_accessibility_method",
    "result",
    "csv_download_url",
  ],
  title: "ConformationalBPrediction",
} as const;

export const ConformationalBPredictionCreateSchema = {
  properties: {
    job_id: {
      type: "string",
      title: "Job Id",
    },
    sequence: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Sequence",
    },
    pdb_id: {
      anyOf: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
      title: "Pdb Id",
    },
    chain: {
      anyOf: [
        {
          type: "string",
          maxLength: 50,
        },
        {
          type: "null",
        },
      ],
      title: "Chain",
    },
    is_structure_based: {
      type: "boolean",
      title: "Is Structure Based",
      default: false,
    },
    bcr_recognition_probability_method: {
      type: "string",
      maxLength: 50,
      title: "Bcr Recognition Probability Method",
    },
    surface_accessibility_method: {
      anyOf: [
        {
          type: "string",
          maxLength: 50,
        },
        {
          type: "null",
        },
      ],
      title: "Surface Accessibility Method",
    },
    result: {
      items: {
        $ref: "#/components/schemas/PredictionResult",
      },
      type: "array",
      title: "Result",
      default: [],
    },
  },
  type: "object",
  required: ["job_id", "bcr_recognition_probability_method"],
  title: "ConformationalBPredictionCreate",
} as const;

export const HTTPValidationErrorSchema = {
  properties: {
    detail: {
      items: {
        $ref: "#/components/schemas/ValidationError",
      },
      type: "array",
      title: "Detail",
    },
  },
  type: "object",
  title: "HTTPValidationError",
} as const;

export const HealthCheckResponseSchema = {
  properties: {
    message: {
      type: "string",
      title: "Message",
    },
    batches_processed: {
      type: "integer",
      title: "Batches Processed",
    },
    title: {
      type: "string",
      title: "Title",
    },
    content: {
      type: "string",
      title: "Content",
    },
    transcript: {
      type: "string",
      title: "Transcript",
    },
  },
  type: "object",
  required: ["message", "batches_processed", "title", "content", "transcript"],
  title: "HealthCheckResponse",
} as const;

export const JobSchema = {
  properties: {
    profile_id: {
      type: "string",
      title: "Profile Id",
    },
    id: {
      type: "string",
      title: "Id",
    },
    created_at: {
      type: "string",
      format: "date-time",
      title: "Created At",
    },
    updated_at: {
      type: "string",
      format: "date-time",
      title: "Updated At",
    },
    name: {
      type: "string",
      title: "Name",
    },
    type: {
      $ref: "#/components/schemas/JobType",
    },
    status: {
      $ref: "#/components/schemas/JobStatus",
    },
    share_token: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Share Token",
    },
    conformational_b_predictions: {
      items: {
        $ref: "#/components/schemas/ConformationalBPrediction",
      },
      type: "array",
      title: "Conformational B Predictions",
      default: [],
    },
  },
  type: "object",
  required: [
    "profile_id",
    "id",
    "created_at",
    "updated_at",
    "name",
    "type",
    "status",
    "share_token",
  ],
  title: "Job",
} as const;

export const JobCreateSchema = {
  properties: {
    name: {
      type: "string",
      maxLength: 256,
      title: "Name",
    },
    type: {
      $ref: "#/components/schemas/JobType",
    },
  },
  type: "object",
  required: ["name", "type"],
  title: "JobCreate",
} as const;

export const JobStatusSchema = {
  type: "string",
  enum: ["pending", "running", "completed", "failed"],
  title: "JobStatus",
} as const;

export const JobTypeSchema = {
  type: "string",
  enum: ["linear-b", "conformational-b", "mhc-i", "mhc-ii"],
  title: "JobType",
} as const;

export const JobUpdateSchema = {
  properties: {
    id: {
      type: "string",
      title: "Id",
    },
    name: {
      anyOf: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      title: "Name",
    },
    type: {
      anyOf: [
        {
          $ref: "#/components/schemas/JobType",
        },
        {
          type: "null",
        },
      ],
    },
    share_token: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Share Token",
    },
  },
  type: "object",
  required: ["id"],
  title: "JobUpdate",
} as const;

export const LBPredictionResultSchema = {
  properties: {
    Peptide_Sequence: {
      type: "string",
      title: "Peptide Sequence",
    },
    Linear_B_Cell_Immunogenicity: {
      anyOf: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      title: "Linear B Cell Immunogenicity",
    },
    Linear_BCR_Recognition: {
      type: "number",
      title: "Linear Bcr Recognition",
    },
  },
  type: "object",
  required: [
    "Peptide_Sequence",
    "Linear_B_Cell_Immunogenicity",
    "Linear_BCR_Recognition",
  ],
  title: "LBPredictionResult",
} as const;

export const LinearBPredictionCreateSchema = {
  properties: {
    job_id: {
      type: "string",
      title: "Job Id",
    },
    sequence: {
      type: "string",
      title: "Sequence",
    },
    b_cell_immunogenicity_method: {
      anyOf: [
        {
          type: "string",
          maxLength: 50,
        },
        {
          type: "null",
        },
      ],
      title: "B Cell Immunogenicity Method",
    },
    bcr_recognition_probability_method: {
      type: "string",
      maxLength: 50,
      title: "Bcr Recognition Probability Method",
    },
    result: {
      items: {
        $ref: "#/components/schemas/LBPredictionResult",
      },
      type: "array",
      title: "Result",
      default: [],
    },
  },
  type: "object",
  required: ["job_id", "sequence", "bcr_recognition_probability_method"],
  title: "LinearBPredictionCreate",
} as const;

export const MhcIIPredictionCreateSchema = {
  properties: {
    job_id: {
      type: "string",
      title: "Job Id",
    },
    sequence: {
      type: "string",
      title: "Sequence",
    },
    alleles: {
      items: {
        type: "string",
      },
      type: "array",
      title: "Alleles",
    },
    tcr_recognition_probability_method: {
      type: "string",
      maxLength: 50,
      title: "Tcr Recognition Probability Method",
    },
    mhc_binding_affinity_method: {
      type: "string",
      maxLength: 50,
      title: "Mhc Binding Affinity Method",
    },
    pmhc_stability_method: {
      type: "string",
      maxLength: 50,
      title: "Pmhc Stability Method",
    },
    result: {
      items: {
        $ref: "#/components/schemas/MhcIIPredictionResult",
      },
      type: "array",
      title: "Result",
      default: [],
    },
  },
  type: "object",
  required: [
    "job_id",
    "sequence",
    "alleles",
    "tcr_recognition_probability_method",
    "mhc_binding_affinity_method",
    "pmhc_stability_method",
  ],
  title: "MhcIIPredictionCreate",
} as const;

export const MhcIIPredictionResultSchema = {
  properties: {
    Peptide_Sequence: {
      type: "string",
      title: "Peptide Sequence",
    },
    ClassII_TCR_Recognition: {
      type: "number",
      title: "Classii Tcr Recognition",
    },
    ClassII_MHC_Binding_Affinity: {
      type: "string",
      title: "Classii Mhc Binding Affinity",
    },
    ClassII_pMHC_Stability: {
      type: "string",
      title: "Classii Pmhc Stability",
    },
    Best_Binding_Affinity: {
      type: "string",
      title: "Best Binding Affinity",
    },
    Best_pMHC_Stability: {
      type: "string",
      title: "Best Pmhc Stability",
    },
  },
  type: "object",
  required: [
    "Peptide_Sequence",
    "ClassII_TCR_Recognition",
    "ClassII_MHC_Binding_Affinity",
    "ClassII_pMHC_Stability",
    "Best_Binding_Affinity",
    "Best_pMHC_Stability",
  ],
  title: "MhcIIPredictionResult",
} as const;

export const MhcIPredictionCreateSchema = {
  properties: {
    job_id: {
      type: "string",
      title: "Job Id",
    },
    sequence: {
      type: "string",
      title: "Sequence",
    },
    alleles: {
      items: {
        type: "string",
      },
      type: "array",
      title: "Alleles",
    },
    tcr_recognition_probability_method: {
      type: "string",
      maxLength: 50,
      title: "Tcr Recognition Probability Method",
    },
    mhc_binding_affinity_method: {
      type: "string",
      maxLength: 50,
      title: "Mhc Binding Affinity Method",
    },
    pmhc_stability_method: {
      type: "string",
      maxLength: 50,
      title: "Pmhc Stability Method",
    },
    result: {
      items: {
        $ref: "#/components/schemas/MhcIPredictionResult",
      },
      type: "array",
      title: "Result",
      default: [],
    },
  },
  type: "object",
  required: [
    "job_id",
    "sequence",
    "alleles",
    "tcr_recognition_probability_method",
    "mhc_binding_affinity_method",
    "pmhc_stability_method",
  ],
  title: "MhcIPredictionCreate",
} as const;

export const MhcIPredictionResultSchema = {
  properties: {
    Peptide_Sequence: {
      type: "string",
      title: "Peptide Sequence",
    },
    ClassI_TCR_Recognition: {
      type: "number",
      title: "Classi Tcr Recognition",
    },
    ClassI_MHC_Binding_Affinity: {
      type: "string",
      title: "Classi Mhc Binding Affinity",
    },
    ClassI_pMHC_Stability: {
      type: "string",
      title: "Classi Pmhc Stability",
    },
    Best_Binding_Affinity: {
      type: "string",
      title: "Best Binding Affinity",
    },
    Best_pMHC_Stability: {
      type: "string",
      title: "Best Pmhc Stability",
    },
  },
  type: "object",
  required: [
    "Peptide_Sequence",
    "ClassI_TCR_Recognition",
    "ClassI_MHC_Binding_Affinity",
    "ClassI_pMHC_Stability",
    "Best_Binding_Affinity",
    "Best_pMHC_Stability",
  ],
  title: "MhcIPredictionResult",
} as const;

export const PredictionProcessingResponseSchema = {
  properties: {
    message: {
      type: "string",
      title: "Message",
    },
    job_id: {
      type: "string",
      title: "Job Id",
    },
  },
  type: "object",
  required: ["message", "job_id"],
  title: "PredictionProcessingResponse",
} as const;

export const PredictionResultSchema = {
  properties: {
    PDB_ID: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Pdb Id",
    },
    Chain: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      title: "Chain",
    },
    Residue_position: {
      type: "integer",
      title: "Residue Position",
    },
    AA: {
      type: "string",
      title: "Aa",
    },
    Epitope_score: {
      type: "number",
      title: "Epitope Score",
    },
    N_glyco_label: {
      type: "integer",
      title: "N Glyco Label",
    },
    Hydrophilicity: {
      type: "number",
      title: "Hydrophilicity",
    },
    Charge: {
      type: "integer",
      title: "Charge",
    },
    ASA: {
      anyOf: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      title: "Asa",
    },
    RSA: {
      anyOf: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      title: "Rsa",
    },
    B_Factor: {
      anyOf: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      title: "B Factor",
    },
  },
  type: "object",
  required: [
    "PDB_ID",
    "Chain",
    "Residue_position",
    "AA",
    "Epitope_score",
    "N_glyco_label",
    "Hydrophilicity",
    "Charge",
  ],
  title: "PredictionResult",
} as const;

export const UnauthorizedErrorResponseSchema = {
  properties: {
    detail: {
      type: "string",
      title: "Detail",
    },
  },
  type: "object",
  required: ["detail"],
  title: "UnauthorizedErrorResponse",
} as const;

export const ValidationErrorSchema = {
  properties: {
    loc: {
      items: {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "integer",
          },
        ],
      },
      type: "array",
      title: "Location",
    },
    msg: {
      type: "string",
      title: "Message",
    },
    type: {
      type: "string",
      title: "Error Type",
    },
  },
  type: "object",
  required: ["loc", "msg", "type"],
  title: "ValidationError",
} as const;

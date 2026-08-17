import { z } from "zod";
import {
  DEFAULT_PE_DEFLECTION_LIMIT_PCT,
  DEFAULT_PE_DESIGNATION,
  DEFAULT_PE_DR,
  DEFAULT_PE_SIZE_ID,
  DEFAULT_PE_STRAIN_LIMIT_PCT,
} from "@/domain/pipeline/pePresets";
import { PeInputFields, PeModulusMode, PipeMaterial } from "@/domain/pipeline/types";

/** Optional positive number that tolerates an empty input (NaN) */
const optionalPositive = z.preprocess(
  (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
  z.number().positive().optional()
);

/** Optional number that tolerates an empty input (NaN) */
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
  z.number().optional()
);

/** Zod fields shared by every calculation form for PE (CSA B137.4) support */
export const peSchemaFields = {
  pipeMaterial: z.enum(["STEEL", "PE"]).optional(),
  peSizeId: z.string().optional(),
  peDesignation: z.string().optional(),
  dimensionRatio: optionalPositive,
  peModulusMode: z.enum(["AUTO", "SHORT_TERM", "LONG_TERM", "CUSTOM"]).optional(),
  peModulus: optionalPositive,
  peHDB: optionalPositive,
  peDeflectionLimitPct: optionalPositive,
  peStrainLimitPct: optionalPositive,
  peServiceTempC: optionalNumber,
};


/** Default values injected in every form */
export const PE_FORM_DEFAULTS = {
  pipeMaterial: "STEEL" as PipeMaterial,
  peSizeId: DEFAULT_PE_SIZE_ID,
  peDesignation: DEFAULT_PE_DESIGNATION,
  dimensionRatio: DEFAULT_PE_DR,
  peModulusMode: "AUTO" as PeModulusMode,
  peDeflectionLimitPct: DEFAULT_PE_DEFLECTION_LIMIT_PCT,
  peStrainLimitPct: DEFAULT_PE_STRAIN_LIMIT_PCT,
  peServiceTempC: 23,
};

/** Extract the PE part of a submitted form payload */
export function extractPeInputs(data: Record<string, unknown>): Omit<PeInputFields, "unitsSystem"> {
  return {
    pipeMaterial: (data.pipeMaterial as PipeMaterial) ?? "STEEL",
    peSizeId: data.peSizeId as string | undefined,
    peDesignation: data.peDesignation as string | undefined,
    dimensionRatio: data.dimensionRatio as number | undefined,
    peModulusMode: data.peModulusMode as PeModulusMode | undefined,
    peModulus: data.peModulus as number | undefined,
    peHDB: data.peHDB as number | undefined,
    peDeflectionLimitPct: data.peDeflectionLimitPct as number | undefined,
    peStrainLimitPct: data.peStrainLimitPct as number | undefined,
    peServiceTempC: data.peServiceTempC as number | undefined,
  };
}

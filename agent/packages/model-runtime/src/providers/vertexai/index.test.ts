// @vitest-environment node
import { GoogleGenAI } from '@google/genai';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../../types/error';
import { TutGoogleAI } from '../google';
import { TutVertexAI } from './index';

// Mock dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function (options: { location?: string }) {
    if (options.location === 'error-location') {
      const error = new Error('Illegal argument');
      error.name = 'IllegalArgumentError';
      throw error;
    }
    return {
      generateContent: vi.fn(),
    };
  }),
}));

vi.mock('../google', () => ({
  TutGoogleAI: vi.fn(function () {
    return {
      chat: vi.fn(),
      models: vi.fn(),
    };
  }),
}));

describe('TutVertexAI', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initFromVertexAI', () => {
    it('should create TutVertexAI instance with default location', () => {
      const instance = TutVertexAI.initFromVertexAI();
      expect(instance).toBeDefined();
    });

    it('should create TutVertexAI instance with custom location', () => {
      const instance = TutVertexAI.initFromVertexAI({
        location: 'us-central1',
        project: 'test-project',
      });
      expect(instance).toBeDefined();
    });

    it('should pass modelIdMapping to TutGoogleAI without passing it to GoogleGenAI', () => {
      TutVertexAI.initFromVertexAI({
        location: 'us-central1',
        modelIdMapping: { 'logical-gemini': 'vertex-upstream' },
        project: 'test-project',
      });

      const googleGenAIOptions = vi.mocked(GoogleGenAI).mock.calls.at(-1)?.[0] as any;
      const tutGoogleAIOptions = vi.mocked(TutGoogleAI).mock.calls.at(-1)?.[0] as any;

      expect(googleGenAIOptions.modelIdMapping).toBeUndefined();
      expect(tutGoogleAIOptions).toMatchObject({
        isVertexAi: true,
        modelIdMapping: { 'logical-gemini': 'vertex-upstream' },
      });
    });

    it('should throw InvalidVertexCredentials error when IllegalArgumentError occurs', () => {
      try {
        TutVertexAI.initFromVertexAI({
          location: 'error-location',
        });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.errorType).toBe(AgentRuntimeErrorType.InvalidVertexCredentials);
      }
    });
  });
});

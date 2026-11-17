import { describe, expect, it } from 'vitest';
import { MAX_DOCUMENT_BYTES } from '../constants/signup';
import {
  signupSchema,
  phoneSchema,
  businessSchema,
  industrySchema,
} from '../schemas/signup-schemas';
import { validateDocument } from './document-preview';
import {
  createSignupDraft,
  documentsReady,
  signupReducer,
} from './signup-reducer';

describe('signup validation', () => {
  it('requires a valid email, all password requirements, and a matching confirmation', () => {
    expect(
      signupSchema.safeParse({
        email: 'invalid',
        password: 'weak',
        confirmPassword: 'different',
      }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        email: 'olaf@apexretail.com',
        password: 'Example1!',
        confirmPassword: 'Example1!',
      }).success,
    ).toBe(true);
    expect(
      signupSchema.safeParse({
        email: 'olaf@apexretail.com',
        password: 'Example1!',
        confirmPassword: 'Example2!',
      }).success,
    ).toBe(false);
  });

  it.each([
    ['US', '(202) 555-0123'],
    ['GB', '+44 7911 123456'],
    ['PK', '+92 300 1234567'],
  ])('validates international phone input for %s', (country, phone) => {
    expect(phoneSchema.safeParse({ country, phone }).success).toBe(true);
  });
  it.each([
    ['US', '123'],
    ['XX', '+12025550123'],
    ['PK', ''],
    ['US', 'call me at +12025550123'],
  ])('rejects invalid phone input %s %s', (country, phone) => {
    expect(phoneSchema.safeParse({ country, phone }).success).toBe(false);
  });
  it('requires a business name and an Other-industry description only when selected', () => {
    expect(businessSchema.safeParse({ businessName: '  ' }).success).toBe(
      false,
    );
    expect(
      businessSchema.parse({ businessName: ' Northwind Goods LLC ' })
        .businessName,
    ).toBe('Northwind Goods LLC');
    expect(
      industrySchema.safeParse({ industry: 'Unknown', otherIndustry: '' })
        .success,
    ).toBe(false);
    expect(
      industrySchema.safeParse({ industry: 'Other', otherIndustry: '  ' })
        .success,
    ).toBe(false);
    expect(
      industrySchema.safeParse({
        industry: 'Other',
        otherIndustry: 'Digital learning resources',
      }).success,
    ).toBe(true);
    expect(
      industrySchema.safeParse({
        industry: 'Electronics & Gadgets',
        otherIndustry: '',
      }).success,
    ).toBe(true);
  });
});

describe('document metadata validation', () => {
  it.each([
    ['sample.pdf', 'application/pdf'],
    ['sample.JPG', 'image/jpeg'],
    ['sample.jpeg', 'image/jpeg'],
    ['sample.png', 'image/png'],
    ['sample.pdf', ''],
  ])('accepts %s with type %s', (name, type) => {
    expect(validateDocument({ name, type, size: 100 })).toBeUndefined();
  });
  it('accepts the exact 10 MiB boundary and rejects larger or empty files', () => {
    expect(
      validateDocument({
        name: 'sample.pdf',
        type: 'application/pdf',
        size: MAX_DOCUMENT_BYTES,
      }),
    ).toBeUndefined();
    expect(
      validateDocument({
        name: 'sample.pdf',
        type: 'application/pdf',
        size: MAX_DOCUMENT_BYTES + 1,
      }),
    ).toContain('larger than 10 MB');
    expect(
      validateDocument({
        name: 'sample.pdf',
        type: 'application/pdf',
        size: 0,
      }),
    ).toContain('empty');
  });
  it.each([
    ['sample.exe', 'application/octet-stream'],
    ['sample.svg', 'image/svg+xml'],
    ['sample.pdf', 'text/plain'],
  ])('rejects unsupported or mismatched metadata %s', (name, type) => {
    expect(validateDocument({ name, type, size: 100 })).toBe(
      'Choose a PDF, JPG or PNG file.',
    );
  });
});

it('gates submission on four ready documents and invalidates submission when a document changes', () => {
  let draft = createSignupDraft();
  expect(documentsReady(draft)).toBe(false);
  expect(signupReducer(draft, { type: 'submit' }).submitted).toBe(false);
  for (const kind of [
    'incorporation',
    'businessAddress',
    'ownerId',
    'personalAddress',
  ] as const) {
    draft = signupReducer(draft, {
      type: 'document',
      kind,
      document: {
        status: 'ready',
        file: { name: `${kind}.pdf`, type: 'application/pdf', size: 100 },
      },
    });
  }
  expect(documentsReady(draft)).toBe(true);
  draft = signupReducer(draft, { type: 'submit' });
  expect(draft.submitted).toBe(true);
  draft = signupReducer(draft, {
    type: 'document',
    kind: 'ownerId',
    document: { status: 'empty' },
  });
  expect(draft.submitted).toBe(false);
  expect(documentsReady(draft)).toBe(false);
});

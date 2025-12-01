import { memo } from 'react';

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

const defaultProps: IconProps = {
  className: 'w-5 h-5',
  strokeWidth: 2,
};

export const IconX = memo(function IconX({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
});

export const IconPlus = memo(function IconPlus({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 4v16m8-8H4" />
    </svg>
  );
});

export const IconMinus = memo(function IconMinus({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M20 12H4" />
    </svg>
  );
});

export const IconCheck = memo(function IconCheck({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M5 13l4 4L19 7" />
    </svg>
  );
});

export const IconTrash = memo(function IconTrash({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
});

export const IconShoppingBag = memo(function IconShoppingBag({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
});

export const IconChevronDown = memo(function IconChevronDown({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M19 9l-7 7-7-7" />
    </svg>
  );
});

export const IconSearch = memo(function IconSearch({
  className = defaultProps.className,
  strokeWidth = defaultProps.strokeWidth
}: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
});

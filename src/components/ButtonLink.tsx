import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Props = PropsWithChildren<{ to: LinkProps['to']; className?: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>>;
export function ButtonLink({ to, className = '', children, ...props }: Props) {
  return <Link to={to} className={`button-link ${className}`} {...props}>{children}</Link>;
}

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' | 'quiet' | 'danger'; size?: 'default' | 'small' }>;
export function Button({ children, className = '', tone = 'primary', size = 'default', ...props }: ButtonProps) {
  return <button className={`button button--${tone}${size === 'small' ? ' button--small' : ''} ${className}`} {...props}>{children}</button>;
}

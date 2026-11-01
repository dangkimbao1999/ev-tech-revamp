import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import NotFound from './not-found'

test('404 page explains and links home', () => {
  render(<NotFound />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Không tìm thấy trang')
  expect(screen.getByText('Về trang chủ').getAttribute('href')).toBe('/')
})

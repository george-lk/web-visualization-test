import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HelloCanvas } from './hello-canvas';

describe('HelloCanvas', () => {
  let component: HelloCanvas;
  let fixture: ComponentFixture<HelloCanvas>;
  let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>;
  let cancelAnimationFrameSpy: ReturnType<typeof vi.spyOn>;

  const mockContext = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    font: ''
  } as unknown as CanvasRenderingContext2D;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
    requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 7);
    cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      return;
    });

    await TestBed.configureTestingModule({
      imports: [HelloCanvas]
    }).compileComponents();

    fixture = TestBed.createComponent(HelloCanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render canvas element', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('canvas.canvas')).not.toBeNull();
  });

  it('should start animation loop and cancel it on destroy', () => {
    fixture.detectChanges();
    expect(requestAnimationFrameSpy).toHaveBeenCalled();

    fixture.destroy();
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(7);
  });

  it('should toggle pause and resume on pause-handle clicks', () => {
    fixture.detectChanges();
    const canvas = fixture.nativeElement.querySelector('canvas.canvas') as HTMLCanvasElement;
    const initialRafCalls = requestAnimationFrameSpy.mock.calls.length;

    canvas.dispatchEvent(new MouseEvent('click', { clientX: 950, clientY: 30, bubbles: true }));
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(7);

    canvas.dispatchEvent(new MouseEvent('click', { clientX: 950, clientY: 30, bubbles: true }));
    expect(requestAnimationFrameSpy.mock.calls.length).toBeGreaterThan(initialRafCalls);
  });
});

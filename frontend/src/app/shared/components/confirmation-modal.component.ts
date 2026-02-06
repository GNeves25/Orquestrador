import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-icon">
          ⚠️
        </div>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        
        <div class="modal-actions">
          <button *ngIf="!isAlert" class="btn-secondary" (click)="onCancel()">Cancelar</button>
          <button class="btn-primary" (click)="onConfirm()">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: #1e293b;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 450px;
      width: 90%;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    h2 {
      color: #f8fafc;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    p {
      color: #94a3b8;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.2s;
      min-width: 120px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
    }

    .btn-secondary {
      background: #334155;
      color: #f8fafc;
    }

    .btn-secondary:hover {
      background: #475569;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(20px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() title = 'Confirmar Ação';
  @Input() message = 'Tem certeza que deseja prosseguir?';
  @Input() isAlert = false; // New input for Alert mode
  @Input() confirmText = 'Confirmar'; // New input for button text
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}

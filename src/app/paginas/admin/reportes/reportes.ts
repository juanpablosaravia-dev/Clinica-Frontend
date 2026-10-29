import { Component, ElementRef, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Chart, registerables } from 'chart.js';
import { Reportes as DatosReportes } from '../../../modelos/reporte';
import { ReporteService } from '../../../servicios/reporte.service';
import { obtenerMensajeError } from '../../../utilidades/mensaje-error';

// Chart.js necesita registrar los tipos de gráfico que se van a usar (barras, torta, etc.).
Chart.register(...registerables);

// Colores de los gráficos (los mismos de la identidad visual de la app).
const COLORES = ['#0e4f4a', '#f2c230', '#2e5eaa', '#c77d12', '#6b3fa0', '#1f7a70'];

// Dashboard de reportes (admin). Un filtro de fechas actualiza los cuatro indicadores a la vez.
// Gráficos con la librería Chart.js: turnos por especialidad (barras) y por sede (torta).
@Component({
  selector: 'app-reportes',
  imports: [
    DecimalPipe,
    PercentPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
  ],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  private fb = inject(FormBuilder);
  private reporteService = inject(ReporteService);
  private snackBar = inject(MatSnackBar);

  // Referencias a los <canvas> del HTML donde Chart.js dibuja.
  // viewChild (sin .required) devuelve undefined mientras el canvas no exista.
  private canvasEspecialidad = viewChild<ElementRef<HTMLCanvasElement>>('canvasEspecialidad');
  private canvasSede = viewChild<ElementRef<HTMLCanvasElement>>('canvasSede');

  // Los gráficos creados, para destruirlos antes de dibujar los nuevos.
  private graficos: Chart[] = [];

  reportes = signal<DatosReportes | null>(null);
  cargando = signal(false);

  columnasRanking = ['puesto', 'medico', 'atendidos'];

  filtros = this.fb.nonNullable.group({
    desde: [''],
    hasta: [''],
  });

  constructor() {
    // Cuando llegan reportes nuevos y los canvas ya están en pantalla, se redibujan.
    effect(() => {
      const reportes = this.reportes();
      const canvasEspecialidad = this.canvasEspecialidad();
      const canvasSede = this.canvasSede();
      if (reportes && canvasEspecialidad && canvasSede) {
        this.dibujarGraficos(reportes, canvasEspecialidad.nativeElement, canvasSede.nativeElement);
      }
    });
  }

  ngOnInit(): void {
    this.actualizar();
  }

  // Pide los cuatro reportes juntos (forkJoin en el servicio) con el rango de fechas.
  actualizar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && hasta < desde) {
      this.snackBar.open('La fecha "hasta" debe ser posterior a "desde"', 'Cerrar', { duration: 4000 });
      return;
    }

    this.cargando.set(true);
    this.reporteService.obtenerTodos(desde, hasta).subscribe({
      next: (reportes) => {
        this.reportes.set(reportes);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.snackBar.open(obtenerMensajeError(error), 'Cerrar', { duration: 5000 });
      },
    });
  }

  limpiar(): void {
    this.filtros.reset();
    this.actualizar();
  }

  private dibujarGraficos(
    reportes: DatosReportes,
    canvasEspecialidad: HTMLCanvasElement,
    canvasSede: HTMLCanvasElement,
  ): void {
    this.graficos.forEach((grafico) => grafico.destroy());

    const barras = new Chart(canvasEspecialidad, {
      type: 'bar',
      data: {
        labels: reportes.porEspecialidad.map((fila) => fila.descripcion),
        datasets: [
          {
            label: 'Turnos',
            data: reportes.porEspecialidad.map((fila) => fila.cantidad),
            backgroundColor: COLORES[0],
          },
        ],
      },
      // maintainAspectRatio: false = ocupa la altura del contenedor; precision: 0 = solo números enteros
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { precision: 0 } } },
      },
    });

    const torta = new Chart(canvasSede, {
      type: 'pie',
      data: {
        labels: reportes.porSede.map((fila) => fila.nombre),
        datasets: [
          {
            data: reportes.porSede.map((fila) => fila.cantidad),
            backgroundColor: COLORES,
          },
        ],
      },
      options: { maintainAspectRatio: false },
    });

    this.graficos = [barras, torta];
  }
}

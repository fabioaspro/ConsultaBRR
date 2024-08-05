import { ChangeDetectorRef, Component, inject, OnInit, ViewChild,} from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router} from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoDividerModule, PoFieldModule, PoComboComponent, PoDialogComponent, PoDialogService, PoMenuItem, PoModalAction, 
         PoModalComponent, PoNotificationService, PoTableAction, PoTableColumn,
         PoModalModule, PoTableModule, PoTableComponent, PoMenuModule,
         PoModule, PoButtonModule, PoToolbarModule,
         PoPageModule,} from '@po-ui/ng-components';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ServerTotvsService } from '../services/server-totvs.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    FormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,
    PoFieldModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  private srvTotvs = inject(ServerTotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvDialog = inject(PoDialogService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router)
 
  route= inject(ActivatedRoute)
 
  //Variaveis
  dadosInclusao!: string;
  dadosAlteracao!: string;
  tipoAcao!: string;
  nomeEstabel!: string;

  //ListasCombo
  listaEstabelecimentos!: any[]

  //Formulario
  public form = this.formBuilder.group({
    codEstabel: ['', Validators.required],
    nomeEstabel: [''],
    leadTime: ['', [Validators.required, Validators.minLength(2)]],
    Inclusao: ['', Validators.required],
    Alteracao: ['', Validators.required],
  });

  onSalvar() {
    if (!this.form.valid) {
      this.srvNotification.error('Preencha todos os campos obrigatórios');
      return
    }

    //Dados da tela
    let paramsTela: any = { paramsTela: this.form.value }
    //Chamar o servico
    this.srvTotvs.Salvar(paramsTela).subscribe({
      next: (response: any) => {
        
        //this.listar();
        this.srvNotification.success('Registro Incluido com sucesso')
      },
      error: (e) => {
       // this.srvNotification.error('Ocorreu um erro na requisição ')
      },
    })

    //Volta ao form List
    this.router.navigate(['list']) 
  }

  onCancelar() {
    
    //Volta ao form List
    this.router.navigate(['list']) 
    
  }

  ngOnInit(): void {

    //Carregar combo de estabelecimentos
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
        console.log(response)
        this.listaEstabelecimentos = (response as any[]).sort(
          this.srvTotvs.ordenarCampos(['label']))
      },
      error: (e) => {
        //this.srvNotification.error('Ocorreu um erro na requisição')
        return
      },
    });

    this.route.params.subscribe(params => {

      if (params['id'] !== '0') { //Alteracao

        //this.form.controls['codEstabel'].setValue (params['id']);
        //this.form.controls['leadTime'].setValue (params['id']);
        //this.form.controls['Inclusao'].setValue ("super - 02/08/2024");
        //this.form.controls['Alteracao'].setValue (params['id']);

        this.tipoAcao = "E"
        this.srvTotvs.ObterID({codEstabel: params['id']}).subscribe({
            next: (response: any) => {
              this.form.patchValue(response.items[0])
              this.form.controls['Alteracao'].setValue ("super - 02/08/2024")
              this.nomeEstabel = response.items[0].nomeEstabel
            },
            error: (e) => {
              //this.srvNotification.error('Ocorreu um erro na requisição')
              return
            },
          })
      }
      else { //Inclusao

        this.tipoAcao = "I"
        this.form.controls['codEstabel'].setValue ("");
        this.form.controls['leadTime'].setValue ("");
        this.form.controls['Inclusao'].setValue ("super - 01/08/2024");
        this.form.controls['Alteracao'].setValue ("");

      }

    })
  }
}

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoDividerModule, PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoTableComponent,} from '@po-ui/ng-components';
import { ServerTotvsService } from './services/server-totvs.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PoModalModule,
    PoTableModule,
    PoMenuModule,
    PoModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule,
  ],templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  @ViewChild('poTable') poTable!: PoTableComponent;
  
  private srvTotvs = inject(ServerTotvsService);
  private formBuilder = inject(FormBuilder);
  readonly menus: Array<PoMenuItem> = [
    { label: 'ConsultaBRR', action: this.onClick.bind(this) },
  ];

  // Referência para o componente PO-Table
  
  
  //Variaveis 
  loadTela: boolean = false
  tituloTela!:string
  //lista: any;
  tipoAcao:string=''

  //---Grid
  opcoes!: PoTableAction[]
  colunas!: PoTableColumn[]
  lista!: any[]
  
  private onClick() {
    alert('Clicked in menu item');
  }


  ngOnInit(): void {
    
    //--- Titulo Tela
    //this.srvTotvs.EmitirParametros({estabInfo:'', tecInfo:'', processoInfo:'', tituloTela: 'HTMLA41 - PARÂMETROS DA FILIAL', ard: false})

    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunas()

    //Tempo Mensagem
    //this.srvNotification.setDefaultDuration(3000)

    //Listar no grid
    //this.listar()

    //Carregar combo de estabelecimentos
    /*this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
        this.listaEstabelecimentos = (response as any[]).sort(
          this.srvTotvs.ordenarCampos(['label']))
      },
      error: (e) => {
        //this.srvNotification.error('Ocorreu um erro na requisição')
        return
      },
    });

    //Carregar combo transportadoras
    this.srvTotvs.ObterTransportadoras().subscribe({
      next: (response: any) => {
        this.listaTransp = (response as any[]).sort(
          this.srvTotvs.ordenarCampos(['label'])
        )
      },
     // error: (e) => this.srvNotification.error('Ocorreu um erro na requisição'),
    })
*/
    //Aplicar changes na tela
   //this.cdRef.detectChanges()

  }

  

}

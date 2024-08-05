import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals,} from '@po-ui/ng-components';
import { ServerTotvsService } from '../services/server-totvs.service';
import { ExcelService } from '../services/excel-service.service';


@Component({
  selector: 'app-list',
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
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

  private srvTotvs = inject(ServerTotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvExcel = inject(ExcelService);
  private srvDialog = inject(PoDialogService);
  private router = inject(Router)
  private formConsulta = inject(FormBuilder);

  //Variaveis 
  loadTela: boolean = false
  loadExcel:boolean = false
  tituloTela!:string
  //lista: any;
  tipoAcao:string=''

  //---Grid
  colunas!: PoTableColumn[]
  lista!: any[]
   customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados'
  };
  
  //Formulario
  public form = this.formConsulta.group({
    codEstabel: ['', Validators.required],
    codFilial: ['', Validators.required],
    numRR: ['', Validators.required],
    //itCodigo: ['', Validators.required],
    tpBusca: ['', Validators.required],
  });

  //--- Actions
  readonly opcoes: PoTableAction[] = [
    {
      label: 'Editar',
      icon: 'bi bi-pencil-square',
      action: this.onEditar.bind(this),
    },
    {
      separator:true,
      label: 'Deletar',
      icon: 'bi bi-trash',
      action: this.onDeletar.bind(this),
      type:'danger'
    }];

  
  readonly acaoSalvar: PoModalAction = {
    label: 'Salvar',
    action: () => { this.onSalvar() }
  }

  readonly acaoCancelar: PoModalAction = {
    label: 'Cancelar',
    action: () => { //this.cadModal?.close()
       }
  }
  formBuilder: any;
  nomeEstabel: string | undefined;

  changeBusca(event: any) {
    
    this.form.controls['tpBusca'].setValue (event)
    
  }
  ngOnInit(): void {
    
    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunas()

    //Apenas para testar
    this.form.controls['codEstabel'].setValue('101')
    this.form.controls['codFilial'].setValue('07')
    this.form.controls['numRR'].setValue('1035600.0')

    this.form.controls['tpBusca'].setValue ('1')
    
    //alert(this.form.controls['tpBusca'].value)

  }

  /*this.srvTotvs.ObterBRR({codEstabel: params['id']}).subscribe({
    next: (response: any) => {
      this.form.patchValue(response.items[0])
      this.form.controls['Alteracao'].setValue ("super - 02/08/2024")
      this.nomeEstabel = response.items[0].nomeEstabel
    },
    error: (e) => {
      //this.srvNotification.error('Ocorreu um erro na requisição')
      return
    },
  })*/
  
  ChamaObterBRR(){
    this.loadTela = true;
    let paramsTela: any = { items: this.form.value }
    console.log(paramsTela)
    //Chamar o servico
    this.srvTotvs.ObterBRR(paramsTela).subscribe({
      next: (response: any) => {
        this.srvNotification.success('Dados listados com sucesso !' + response)
        this.lista = response.items
        this.lista.sort(this.srvTotvs.ordenarCampos(['iNecess']))
        this.loadTela = false
      },
      error: (e) => {
        this.srvNotification.error('Ocorreu um erro ObterBRR: ' + e)
        this.loadTela = false
      },
    })
    /*let params: any = { itens: this.form.value};
    console.log(params)
    this.srvTotvs.ObterBRR(params).subscribe({
      next: (response: any) => {
        if (response === null) return
        this.lista = response.items
        this.loadTela = false
      },
      error: (e) => {
                    //this.srvNotification.error('Ocorreu um erro na requisição')
                    this.srvNotification.error("Erro ao Obter BRR:" + e)
                    this.loadTela=false},
    });*/
    
  }

  //---------------------------------------------------------------- Exportar lista detalhe para excel
  public onExportarExcel(){
    //let titulo = this.tituloDetalhe.split(':')[0]
    //let subTitulo = this.tituloDetalhe.split(':')[1]
    this.loadExcel = true

    this.srvExcel.exportarParaExcel('RESUMO DE ' +
                                    "titulo.toUpperCase()",
                                    "subTitulo.toUpperCase()",
                                    this.colunas,
                                    this.colunas,
                                    'Lista_BRR',
                                    'Plan1')
     this.loadExcel = false;
  }
  //---Listar registros grid
  listar() {
    this.loadTela = true;

    this.srvTotvs.Obter().subscribe({
      next: (response: any) => {
        if (response === null) return
        this.lista = response.items 
        this.loadTela = false
      },
      error: (e) => {
                    //this.srvNotification.error('Ocorreu um erro na requisição')
                    this.srvNotification.error("Erro ao chamar Obter Lista:" + e)
                    this.loadTela=false},
    });
  }

  //Chama tela do TOTVS
  public AbrirTelaTOTVS(programa: string): void {
    let params: any = { program: programa, params: '' };
    this.srvTotvs.AbrirTelaTOTVS(params).subscribe({
      next: (response: any) => {},
      error: (e) => {
        this.loadTela = false;
        //mensagem pro usuario
        this.srvNotification.error("Erro ao chamar AbrirTelaTOTV:" + e)
      },
    });
  }

  //---Novo registro
  onNovo() {
    
    //Criar um registro novo passando 0 o ID
    this.router.navigate(['form/0']) 
    
  }

  //---Editar registro
  onEditar(obj: any | null) {    

    /*
    this.nomeEstabel = ''

    if ((obj !== null) && (obj['$showAction'] !== undefined))
       delete obj['$showAction']

    if (obj !== null) {
      this.nomeEstabel = obj.nomeEstabel
      this.tipoAcao='E'
      this.form.patchValue(obj)
    }*/

    //Criar um registro novo passando 0 o ID
    
    this.router.navigate(['form/' + obj.codEstabel ]) 

  }

  //---Deletar registro
  onDeletar(obj: any | null) {
    let paramTela:any={codEstabel:obj.codEstabel}
    
    this.srvDialog.confirm({
      title: "DELETAR REGISTRO",
      message: `Confirma deleção do registro: ${obj.nomeEstabel} ?`,
      confirm: () => {
        this.loadTela = true
        this.srvTotvs.Deletar(paramTela).subscribe({
          next: (response: any) => {
            this.srvNotification.success('Registro eliminado com sucesso')
            this.listar()
          },
         // error: (e) => this.srvNotification.error('Ocorreu um erro na requisição'),
        })
      },
      cancel: () => this.srvNotification.error("Cancelada pelo usuário")
    })
  }

  //---Salvar Registro
  onSalvar(){


  }

}

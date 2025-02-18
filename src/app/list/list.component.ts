import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals, PoTableComponent,} from '@po-ui/ng-components';
import { ServerTotvsService } from '../services/server-totvs.service';
import { ExcelService } from '../services/excel-service.service';
import { escape } from 'querystring';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [    
    CommonModule,
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

export class  ListComponent {

  private srvTotvs = inject(ServerTotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvExcel = inject(ExcelService);
  private srvDialog = inject(PoDialogService);
  private router = inject(Router)
  private formConsulta = inject(FormBuilder);

  
  
  //Variaveis 
  labelLoadTela:string = ''
  loadTela: boolean = false
  loadExcel:boolean = false
  tituloTela!:string
  mudaCampos!:number | null
  pesquisa!:string
  nomeBotao: any;
  lBotao:boolean = false
  alturaGrid:number=window.innerHeight - 295

  //lista: any;
  tipoAcao:string=''
  @ViewChild('poTable') poTable!: PoTableComponent;
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
    itCodigo: [''],
    tpBusca: [2, Validators.required],
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
  valorForm: any;

  changeBusca(event: any) {
    
    this.lista = []
    this.form.controls['tpBusca'].setValue (event)
   
    //alert (this.form.controls['tpBusca'].value)

    this.mudaCampos = this.form.controls['tpBusca'].value

    if (this.form.controls['tpBusca'].value == 1) { //Item
      this.form.reset()
      this.pesquisa = "ITEM " //+ this.form.controls['itCodigo'].value
    }
    else {
      this.form.reset()
      this.pesquisa = "REPARO " //+ this.form.controls['codEstabel'].value + ' - '+ this.form.controls['codFilial'].value + ' - ' + this.form.controls['numRR'].value
    }
    
  }
  ngOnInit(): void {
    
    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunas()
    this.form.controls['tpBusca'].setValue(1);
    this.mudaCampos = 1 //iniciar a variavel
    this.pesquisa = "ITEM"
  }

  ConsultaEmergencial(){

    this.router.navigate(['emergenc'])

  }

  // Método para selecionar programaticamente uma linha
  selecionarLinha(id: number) {
    const item = this.lista.find(i => i.ltFilial === id); // Localiza o item pelo ID
      if (item) {
        this.poTable.selectRowItem(item); // Seleciona o item na tabela
      }
      else {
        alert ("error")
      }
    }
    
  ChamaObterBRR(){
    this.labelLoadTela = "Calculando Prioridade"
    this.loadTela = true;
    this.desabilitaForm()
    let paramsTela: any = { items: this.form.value }
    this.lista = []

     
    if (this.mudaCampos == 1) { //Item
      this.pesquisa = "ITEM " //+ this.form.controls['itCodigo'].value
    }
    else{
      this.pesquisa = "REPARO " // + this.form.controls['codEstabel'].value + ' - '+ this.form.controls['codFilial'].value + ' - ' + this.form.controls['numRR'].value
    }
    //Chamar o servico
    this.srvTotvs.ObterBRR(paramsTela).subscribe({
      next: (response: any) => {
        this.srvNotification.success('Dados listados com sucesso !')
        this.lista = response.items
        this.lista.sort(this.srvTotvs.ordenarCampos(['iOrdem']))
        
        this.loadTela = false
        this.habilitaForm()
      },
      error: (e) => {
        //this.srvNotification.error('Ocorreu um erro ObterBRR: ' + e)
        this.loadTela = false
        this.habilitaForm()
      },
    })    
  } 

  public habilitaForm(){

    this.lBotao = false
    this.form.controls['tpBusca'].enable()
    
    this.form.controls['codEstabel'].enable()
    this.form.controls['codFilial'].enable()
    this.form.controls['numRR'].enable()
    this.form.controls['itCodigo'].enable()
  }

  public desabilitaForm(){

    this.lBotao = true    
    this.form.controls['tpBusca'].disable()
    
    this.form.controls['codEstabel'].disable()
    this.form.controls['codFilial'].disable()
    this.form.controls['numRR'].disable()
    this.form.controls['itCodigo'].disable()
  }
  //---------------------------------------------------------------- Exportar lista detalhe para excel
  public onExportarExcel(){
    let titulo = "BANCO DE REPAROS" //this.tituloTela.split(':')[0]
    let subTitulo = "CONSULTA DE PRIORIDADE" //this.tituloTela.split(':')[1]
    this.loadExcel = true

    let valorForm: any = { valorForm: this.form.value }
    
    this.srvExcel.exportarParaExcel('CONSULTA DE ' + titulo.toUpperCase(),
                                    subTitulo.toUpperCase(),
                                    this.colunas,
                                    this.lista,
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

import { Module, ModuleMetadata } from '@nestjs/common'
import { RouterModule, Routes } from '@nestjs/core'
import { WalletModule } from './wallet/wallet.module'
import { InvestModule } from './invest/invest.module'
import { LoanModule } from './loan/loan.module'

const v1Routes: Routes = [
  {
    path: '/v1',
    children: [
      { path: '/wallet', module: WalletModule },
      { path: '/invest', module: InvestModule },
      { path: '/loan', module: LoanModule },
    ],
  },
]

const routes: Routes = [{ path: '/api', children: v1Routes }]

const getModulesFromRoutes = (routes: Routes) => {
  const modules: ModuleMetadata['imports'] = []

  for (const route of routes) {
    if (route.module) {
      modules.push(route.module)
    }
    if (route.children) {
      modules.push(...getModulesFromRoutes(route.children as Routes))
    }
  }
  return modules
}

@Module({
  imports: [RouterModule.register(routes), ...getModulesFromRoutes(routes)],
})
export class ApiModule {}

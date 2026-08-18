import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  createFixedAccount,
  getFixedAccounts,
  removeFixedAccount,
  updateFixedAccount,
} from '../../application/fixed-accounts';
import {
  calculateExpectedMonthlyTotal,
  fixedAccountCategories,
  fixedAccountCategorySchema,
  type FixedAccount,
} from '../../domain/fixed-account';
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyToCents,
} from '../../utils/currency';
import {
  Button,
  Card,
  Heading,
  Icon,
  SelectField,
  SortableListCard,
  Text,
  TextField,
  type SortableListColumn,
} from '../design-system';
import './fixed-accounts-page.css';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da conta.'),
  category: z
    .string()
    .refine(
      (value) => fixedAccountCategories.some((category) => category === value),
      'Selecione uma categoria.',
    ),
  expectedAmount: z
    .string()
    .trim()
    .min(1, 'Informe o valor previsto.')
    .refine((value) => parseCurrencyToCents(value) !== null, 'Informe um valor válido.'),
});

type FormValues = z.infer<typeof formSchema>;

const categoryOptions = fixedAccountCategories.map((category) => ({
  label: category,
  value: category,
}));

const emptyValues: FormValues = {
  name: '',
  category: '',
  expectedAmount: '',
};

export function FixedAccountsPage() {
  const [accounts, setAccounts] = useState<FixedAccount[]>([]);
  const [editingId, setEditingId] = useState<string>();
  const [isNewFormVisible, setIsNewFormVisible] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<FormValues>({ defaultValues: emptyValues });

  async function refreshAccounts() {
    setAccounts(await getFixedAccounts());
  }

  useEffect(() => {
    void refreshAccounts();
  }, []);

  function openNewAccountForm() {
    setEditingId(undefined);
    reset(emptyValues);
    setIsNewFormVisible(true);
  }

  function openEditAccountForm(account: FixedAccount) {
    setIsNewFormVisible(false);
    setEditingId(account.id);
    reset({
      name: account.name,
      category: account.category,
      expectedAmount: formatCurrencyInput(account.expectedAmountInCents),
    });
  }

  function closeForm() {
    setEditingId(undefined);
    setIsNewFormVisible(false);
  }

  async function removeAccount(account: FixedAccount) {
    const shouldRemove = window.confirm(
      `Remover a conta "${account.name}"? Esta ação não pode ser desfeita.`,
    );

    if (!shouldRemove) return;

    await removeFixedAccount(account.id);
    await refreshAccounts();
  }

  async function submit(values: FormValues) {
    const result = formSchema.safeParse(values);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          setError(field as keyof FormValues, { message: issue.message });
        }
      });
      return;
    }

    const expectedAmountInCents = parseCurrencyToCents(result.data.expectedAmount);

    if (expectedAmountInCents === null) {
      setError('expectedAmount', { message: 'Informe um valor válido.' });
      return;
    }

    const input = {
      name: result.data.name,
      category: fixedAccountCategorySchema.parse(result.data.category),
      expectedAmountInCents,
    };

    if (editingId) await updateFixedAccount(editingId, input);
    else await createFixedAccount(input);

    closeForm();
    await refreshAccounts();
  }

  const total = calculateExpectedMonthlyTotal(accounts);

  function renderAccountForm(title: string, closeLabel: string) {
    return (
      <form className="fixed-account-form" onSubmit={handleSubmit(submit)}>
        <div className="fixed-account-form__heading">
          <Heading as="h2" size="small">{title}</Heading>
          <Button onClick={closeForm} variant="ghost">{closeLabel}</Button>
        </div>
        <div className="fixed-account-form__fields">
          <TextField label="Nome" error={errors.name?.message} {...register('name')} />
          <SelectField
            label="Categoria"
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
          <TextField
            label="Valor previsto"
            inputMode="decimal"
            placeholder="0,00"
            error={errors.expectedAmount?.message}
            {...register('expectedAmount')}
          />
        </div>
        <div className="fixed-account-form__actions">
          <Button disabled={isSubmitting} type="submit">Salvar conta</Button>
        </div>
      </form>
    );
  }

  const accountColumns: SortableListColumn<FixedAccount>[] = [
    {
      id: 'name',
      label: 'Conta',
      width: '38%',
      sortValue: (account) => account.name,
      render: (account) => <strong>{account.name}</strong>,
    },
    {
      id: 'category',
      label: 'Categoria',
      width: '27%',
      sortValue: (account) => account.category,
      render: (account) => account.category,
    },
    {
      id: 'amount',
      label: 'Valor previsto',
      width: '21%',
      align: 'end',
      sortValue: (account) => account.expectedAmountInCents,
      render: (account) => (
        <strong className="fixed-account-list__amount">
          {formatCurrency(account.expectedAmountInCents)}
        </strong>
      ),
    },
    {
      id: 'action',
      label: 'Ação',
      width: '14%',
      align: 'end',
      render: (account) => (
        <div className="fixed-account-list__actions">
          <Button
            aria-label={`Ajustar ${account.name}`}
            iconOnly
            onClick={() => openEditAccountForm(account)}
            title="Ajustar"
            variant="ghost"
          >
            <Icon name="edit" size="sm" />
          </Button>
          <Button
            aria-label={`Remover ${account.name}`}
            iconOnly
            onClick={() => removeAccount(account)}
            title="Remover"
            variant="danger"
          >
            <Icon name="delete" size="sm" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <main className="fixed-accounts-page">
      <header className="fixed-accounts-page__header">
        <div className="fixed-accounts-page__heading">
          <Text as="span" variant="eyebrow">Planejamento mensal</Text>
          <Heading as="h1" size="display">Contas fixas</Heading>
          <Text className="fixed-accounts-page__description" variant="secondary">
            Organize os compromissos recorrentes e acompanhe o valor previsto para o mês.
          </Text>
        </div>
        <Button aria-label="Adicionar conta" iconOnly onClick={openNewAccountForm} title="Adicionar conta">
          <Icon name="add" />
        </Button>
      </header>

      <Card className="fixed-accounts-page__summary">
        <Text as="span" variant="secondary">Total mensal previsto</Text>
        <strong className="fixed-accounts-page__total">{formatCurrency(total)}</strong>
        <Text as="small" variant="caption">{accounts.length} contas cadastradas</Text>
      </Card>

      {isNewFormVisible ? (
        <Card className="fixed-account-form-card">
          {renderAccountForm('Nova conta', 'Fechar')}
        </Card>
      ) : null}

      <SortableListCard
        ariaLabel="Contas fixas cadastradas"
        columns={accountColumns}
        expandedItemKey={editingId}
        getItemKey={(account) => account.id}
        items={accounts}
        renderExpandedItem={() => renderAccountForm('Ajustar conta', 'Cancelar')}
      />
    </main>
  );
}
